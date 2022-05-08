import { Arg, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { getRepository, Repository } from "typeorm";
import { User } from "../entity/user.entity";
import {
  userRegister,
  userLogin,
  userDelete,
  getAllUsers,
} from "../servicies/auth.servicies";
import {
  userInput,
  LoginInput,
  LoginResponse,
  UserDeleteInput,
} from "../dto/auth.dto";
import { isAuth } from "../middlewares/auth.middleware";

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
    return await userRegister(input, this.userRepository);
  }

  @Mutation(() => LoginResponse)
  async login(@Arg("input", () => LoginInput) input: LoginInput) {
    return await userLogin(input, this.userRepository);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteUserById(
    @Arg("input", () => UserDeleteInput) input: UserDeleteInput
  ): Promise<Boolean> {
    return await userDelete(input, this.userRepository);
  }

  @Query(() => [User])
  @UseMiddleware(isAuth)
  async getAllUsers(): Promise<User[]> {
    return await getAllUsers(this.userRepository);
  }
}
