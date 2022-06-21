import { Arg, Mutation, Resolver, Query, UseMiddleware } from "type-graphql";
import { getRepository, Repository } from "typeorm";
import { Author } from "../entity/author.entity";
import {
  AuthorIdInput,
  AuthorInput,
  AuthorUpdateInput,
} from "../dto/author.dto";
import {
  createAuthor,
  deleteAuthor,
  getAllAuthors,
  getAuthor,
  updateAuthor,
} from "../services/author.services";
import { isAuth } from "../middlewares/auth.middleware";

@Resolver()
export class AuthorResolver {
  authorRepository: Repository<Author>;

  constructor() {
    this.authorRepository = getRepository(Author);
  }

  @Mutation(() => Author)
  @UseMiddleware(isAuth)
  async createAuthor(
    @Arg("input", () => AuthorInput) input: AuthorInput
  ): Promise<Author | undefined> {
    return await createAuthor(input, this.authorRepository);
  }

  @Query(() => [Author])
  @UseMiddleware(isAuth)
  async getAllAuthors(): Promise<Author[]> {
    return await getAllAuthors(this.authorRepository);
  }

  @Query(() => Author)
  @UseMiddleware(isAuth)
  async getAuthorById(
    @Arg("input", () => AuthorIdInput) input: AuthorIdInput
  ): Promise<Author | undefined> {
    return await getAuthor(input, this.authorRepository);
  }

  @Mutation(() => Author)
  @UseMiddleware(isAuth)
  async updateAuthorById(
    @Arg("input", () => AuthorUpdateInput) input: AuthorUpdateInput
  ): Promise<Author | undefined> {
    return await updateAuthor(input, this.authorRepository);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteAuthorById(
    @Arg("input", () => AuthorIdInput) input: AuthorIdInput
  ): Promise<Boolean> {
    return await deleteAuthor(input, this.authorRepository);
  }
}
