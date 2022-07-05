import { Arg, Mutation, Resolver, Query, UseMiddleware } from "type-graphql";
import { Author } from "../entity/author.entity";
import {
  AuthorIdInput,
  AuthorInput,
  AuthorUpdateInput,
} from "../dto/author.dto";
import AuthorServices from "../services/author.services";
import { isAuth } from "../middlewares/auth.middleware";

@Resolver()
export class AuthorResolver {
  private authorServices: AuthorServices;

  constructor() {
    this.authorServices = new AuthorServices();
  }

  @Mutation(() => Author)
  @UseMiddleware(isAuth)
  async createAuthor(
    @Arg("input", () => AuthorInput) input: AuthorInput
  ): Promise<Author | undefined> {
    return await this.authorServices.createAuthor(input);
  }

  @Query(() => [Author])
  @UseMiddleware(isAuth)
  async getAllAuthors(): Promise<Author[]> {
    return await this.authorServices.getAllAuthors();
  }

  @Query(() => Author)
  @UseMiddleware(isAuth)
  async getAuthorById(
    @Arg("input", () => AuthorIdInput) input: AuthorIdInput
  ): Promise<Author | undefined> {
    return await this.authorServices.getAuthor(input);
  }

  @Mutation(() => Author)
  @UseMiddleware(isAuth)
  async updateAuthorById(
    @Arg("input", () => AuthorUpdateInput) input: AuthorUpdateInput
  ): Promise<Author | undefined> {
    return await this.authorServices.updateAuthor(input);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteAuthorById(
    @Arg("input", () => AuthorIdInput) input: AuthorIdInput
  ): Promise<Boolean> {
    return await this.authorServices.deleteAuthor(input);
  }
}
