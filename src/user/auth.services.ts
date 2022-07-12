import { getRepository, Repository } from "typeorm";
import { hash, compareSync } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { LoginInput, UserDeleteInput, userInput } from "./auth.dto";
import { User } from "./user.entity";
import { enviroment } from "../config/enviroment";
import { CustomError } from "../errors/custom.error";
import { UserExistsError } from "../errors/userExists.error";
import { UnauthenticatedError } from "../errors/unauthenticated.error";
import { NotUserError } from "../errors/notUser.error";

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
      throw new UserExistsError();
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
      throw new UnauthenticatedError();
    }

    const isValidPassword: boolean = compareSync(password, userFound.password);

    if (!isValidPassword) {
      throw new UnauthenticatedError();
    }

    const jwt: string = sign({ id: userFound.id }, enviroment.JWT_SECRET);

    return {
      user: userFound,
      jwt: jwt,
    };
  };

  userDelete = async (input: UserDeleteInput) => {
    const user = await this.userRepository.findOne(input.userId);

    if (!user) throw new NotUserError();

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
    if (!user) throw new NotUserError();

    return user;
  };
}
