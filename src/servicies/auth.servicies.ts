import { Repository } from "typeorm";
import { hash, compareSync } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { LoginInput, UserDeleteInput, userInput } from "../dto/auth.dto";
import { User } from "../entity/user.entity";
import { enviroment } from "../config/enviroment";

export const userRegister = async (
  input: userInput,
  userRepository: Repository<User>
) => {
  try {
    const { fullName, email, password } = input;

    const userExists = await userRepository.findOne({
      where: { email },
    });

    if (userExists) {
      const error = new Error();
      error.message = "Email is not available";
      throw error;
    }

    const hashedPassword = await hash(password, 10);

    const newUser = await userRepository.insert({
      fullName,
      email,
      password: hashedPassword,
      nBooks: 0,
    });

    return userRepository.findOne(newUser.identifiers[0].id);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const userLogin = async (
  input: LoginInput,
  userRepository: Repository<User>
) => {
  try {
    const { email, password } = input;

    const userFound = await userRepository.findOne({ where: { email } });

    if (!userFound) {
      const error = new Error();
      error.message = "Invalid credential";
      throw error;
    }

    const isValidPassword: boolean = compareSync(password, userFound.password);

    if (!isValidPassword) {
      const error = new Error();
      error.message = "Invalid credential";
      throw error;
    }

    const jwt: string = sign({ id: userFound.id }, enviroment.JWT_SECRET);

    return {
      userId: userFound.id,
      jwt: jwt,
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const userDelete = async (
  input: UserDeleteInput,
  userRepository: Repository<User>
) => {
  try {
    const user = await userRepository.findOne(input.userId);
    if (!user) throw new Error("User does not exist");

    await userRepository.delete(input.userId);
    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getAllUsers = async (userRepository: Repository<User>) => {
  try {
    return await userRepository.find({ relations: ["books"] });
  } catch (error: any) {
    throw new Error(error.message);
  }
};
