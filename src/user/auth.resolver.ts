import { Arg, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { User } from "./user.entity";
import UserServices from "./auth.services";
import {
  userInput,
  LoginInput,
  LoginResponse,
  UserDeleteInput,
} from "./auth.dto";
import { isAuth } from "../middlewares/auth.middleware";

@Resolver()
export class AuthResolver {
  private userServices: UserServices;

  constructor() {
    this.userServices = new UserServices();
  }

  @Mutation(() => User)
  async register(
    @Arg("input", () => userInput) input: userInput
  ): Promise<User | undefined> {
    return await this.userServices.userRegister(input);
  }

  @Mutation(() => LoginResponse)
  async login(@Arg("input", () => LoginInput) input: LoginInput) {
    return await this.userServices.userLogin(input);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteUserById(
    @Arg("input", () => UserDeleteInput) input: UserDeleteInput
  ): Promise<Boolean> {
    return await this.userServices.userDelete(input);
  }

  @Query(() => [User])
  @UseMiddleware(isAuth)
  async getAllUsers(): Promise<User[]> {
    return await this.userServices.getAllUsers();
  }

  @Query(() => User)
  @UseMiddleware(isAuth)
  async getUser(
    @Arg("input", () => UserDeleteInput) input: UserDeleteInput
  ): Promise<User> {
    return await this.userServices.getUser(input);
  }
}
