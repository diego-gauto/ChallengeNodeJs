import { getRepository, Repository } from "typeorm";
import { hash, compareSync } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { LoginInput, UserDeleteInput, userInput } from "./auth.dto";
import { User } from "./user.entity";
import { enviroment } from "../config/enviroment";
import { CustomError } from "../errors/custom.error";

export default class UserService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = getRepository(User);
  }

  userRegister = async (input: userInput) => {
    const { fullName, email, password } = input;

    const userExists = await this.userRepository.findOne({
      where: { email },
    });

    if (userExists) {
      throw new CustomError("User is already exist", "BAD_USER_INPUT");
    }

    const hashedPassword = await hash(password, 10);

    const newUser = await this.userRepository.insert({
      fullName,
      email,
      password: hashedPassword,
      nBooks: 0,
    });

    return this.userRepository.findOne(newUser.identifiers[0].id);
  };

  userLogin = async (input: LoginInput) => {
    const { email, password } = input;

    const userFound = await this.userRepository.findOne({
      where: { email },
      relations: ["books", "books.author"],
    });

    if (!userFound) {
      throw new CustomError("Invalid Credential", "BAD_USER_INPUT");
    }

    const isValidPassword: boolean = compareSync(password, userFound.password);

    if (!isValidPassword) {
      throw new CustomError("Invalid Credential", "BAD_USER_INPUT");
    }

    const jwt: string = sign({ id: userFound.id }, enviroment.JWT_SECRET);

    return {
      user: userFound,
      jwt: jwt,
    };
  };

  userDelete = async (input: UserDeleteInput) => {
    const user = await this.userRepository.findOne(input.userId);

    if (!user) throw new CustomError("User doesn't exist", "BAD_USER_INPUT");

    await this.userRepository.delete(input.userId);

    return true;
  };

  getAllUsers = async () => {
    return await this.userRepository.find({ relations: ["books"] });
  };

  getUser = async (input: UserDeleteInput) => {
    const user = await this.userRepository.findOne(input.userId, {
      relations: ["books", "books.author"],
    });
    if (!user) throw new CustomError("User doesn't exist", "BAD_USER_INPUT");

    return user;
  };
}
