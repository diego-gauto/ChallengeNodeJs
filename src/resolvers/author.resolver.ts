import { Arg, Mutation, Resolver, Query } from "type-graphql";
import { Author } from "../entity/author.entity";
import {
  AuthorIdInput,
  AuthorInput,
  AuthorUpdateInput,
} from "../dto/author.dto";
import { getRepository, Repository } from "typeorm";

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
    try {
      const createdAuthor = await this.authorRepository.insert({
        fullName: input.fullName,
      });
      const result = await this.authorRepository.findOne(
        createdAuthor.identifiers[0].id
      );
      return result;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  @Query(() => [Author])
  async getAllAuthors(): Promise<Author[]> {
    try {
      return await this.authorRepository.find({ relations: ["books"] });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  @Query(() => Author)
  async getAuthorById(
    @Arg("input", () => AuthorIdInput) input: AuthorIdInput
  ): Promise<Author | undefined> {
    try {
      const author = await this.authorRepository.findOne(input.id);
      if (!author) {
        const error = new Error();
        error.message = "Author does not exist";
        throw error;
      }
      return author;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  @Mutation(() => Author)
  async updateAuthorById(
    @Arg("input", () => AuthorUpdateInput) input: AuthorUpdateInput
  ): Promise<Author | undefined> {
    try {
      const authorExist = await this.authorRepository.findOne(input.id);

      if (!authorExist) {
        throw new Error("Author does not exist");
      }

      const updatedAuthor = await this.authorRepository.save({
        id: input.id,
        fullName: input.newName,
      });

      return await this.authorRepository.findOne(updatedAuthor.id);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  @Mutation(() => Boolean)
  async deleteAuthorById(
    @Arg("input", () => AuthorIdInput) input: AuthorIdInput
  ): Promise<Boolean> {
    try {
      const author = await this.authorRepository.findOne(input.id);
      if (!author) throw new Error("Author does not exist");

      await this.authorRepository.delete(input.id);
      return true;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
