import { compareSync, hash } from "bcryptjs";
import { IsEmail, Length } from "class-validator";
import {
  Arg,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { getRepository, Repository } from "typeorm";
import { User } from "../entity/user.entity";
import { enviroment } from "../config/enviroment";
import { sign } from "jsonwebtoken";

@InputType()
class userInput {
  @Field()
  @Length(3, 20)
  fullName!: string;

  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @Length(8, 254)
  password!: string;
}

@InputType()
class UserDeleteInput {
  @Field()
  userId!: number;
}

@ObjectType()
class LoginResponse {
  @Field()
  userId!: number;

  @Field()
  jwt!: string;
}

@InputType()
class LoginInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  password!: string;
}

@Resolver()
export class AuthResolver {
  userRepository: Repository<User>;

  constructor() {
    this.userRepository = getRepository(User);
  }

  @Mutation(() => User)
  async register(
    @Arg("input", () => userInput) input: userInput
  ): Promise<User | undefined> {
    try {
      const { fullName, email, password } = input;

      const userExists = await this.userRepository.findOne({
        where: { email },
      });

      if (userExists) {
        const error = new Error();
        error.message = "Email is not available";
        throw error;
      }

      const hashedPassword = await hash(password, 10);

      const newUser = await this.userRepository.insert({
        fullName,
        email,
        password: hashedPassword,
        nBooks: 0,
      });

      return this.userRepository.findOne(newUser.identifiers[0].id);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  @Mutation(() => LoginResponse)
  async login(@Arg("input", () => LoginInput) input: LoginInput) {
    try {
      const { email, password } = input;

      const userFound = await this.userRepository.findOne({ where: { email } });

      if (!userFound) {
        const error = new Error();
        error.message = "Invalid credential";
        throw error;
      }

      const isValidPassword: boolean = compareSync(
        password,
        userFound.password
      );

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
  }

  @Mutation(() => Boolean)
  async deleteUserById(
    @Arg("input", () => UserDeleteInput) input: UserDeleteInput
  ): Promise<Boolean> {
    try {
      const user = await this.userRepository.findOne(input.userId);
      if (!user) throw new Error("User does not exist");

      await this.userRepository.delete(input.userId);
      return true;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  @Query(() => [User])
  async getAllUser(): Promise<User[]> {
    try {
      return await this.userRepository.find();
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
