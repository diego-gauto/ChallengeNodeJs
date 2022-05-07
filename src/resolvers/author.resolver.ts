import { Arg, Mutation, Resolver, Query } from "type-graphql";
import { Author } from "../entity/author.entity";
import {
  AuthorIdInput,
  AuthorInput,
  AuthorUpdateInput,
} from "../dto/author.dto";
import { getRepository, Repository } from "typeorm";
import {
  createAuthor,
  delateAuthor,
  getAllAuthors,
  getAuthor,
  updateAuthor,
} from "../servicies/author.servicies";

@Resolver()
export class AuthorResolver {
  authorRepository: Repository<Author>;

  constructor() {
    this.authorRepository = getRepository(Author);
  }

  @Mutation(() => Author)
  async createAuthor(
    @Arg("input", () => AuthorInput) input: AuthorInput
  ): Promise<Author | undefined> {
    return await createAuthor(input, this.authorRepository);
  }

  @Query(() => [Author])
  async getAllAuthors(): Promise<Author[]> {
    return await getAllAuthors(this.authorRepository);
  }

  @Query(() => Author)
  async getAuthorById(
    @Arg("input", () => AuthorIdInput) input: AuthorIdInput
  ): Promise<Author | undefined> {
    return await getAuthor(input, this.authorRepository);
  }

  @Mutation(() => Author)
  async updateAuthorById(
    @Arg("input", () => AuthorUpdateInput) input: AuthorUpdateInput
  ): Promise<Author | undefined> {
    return await updateAuthor(input, this.authorRepository);
  }

  @Mutation(() => Boolean)
  async deleteAuthorById(
    @Arg("input", () => AuthorIdInput) input: AuthorIdInput
  ): Promise<Boolean> {
    return await delateAuthor(input, this.authorRepository);
  }
}
