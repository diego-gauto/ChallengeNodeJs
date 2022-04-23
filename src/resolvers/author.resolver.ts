import { Arg, Mutation, Resolver, InputType, Field, Query } from "type-graphql";
import { Author } from "../entity/author.entity";
import { getRepository, Repository } from "typeorm";
import { Length } from "class-validator";

@InputType()
class AuthorInput {
  @Field()
  @Length(3, 20)
  fullName!: String;
}

@InputType()
class AuthorIdInput {
  @Field()
  id!: number;
}

@InputType()
class AuthorUpdateInput {
  @Field()
  id!: number;

  @Field()
  @Length(3, 20)
  newName?: string;
}

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
        createdAuthor.identifiers[0]
      );
      return result;
    } catch {
      console.error;
    }
  }

  @Query(() => [Author])
  async getAllAuthors(): Promise<Author[]> {
    return await this.authorRepository.find({ relations: ["books"] });
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
    } catch (e) {
      throw new Error("Something went wrong");
    }
  }

  @Mutation(() => Author)
  async updateAuthorById(
    @Arg("input", () => AuthorUpdateInput) input: AuthorUpdateInput
  ): Promise<Author | undefined> {
    const authorExist = await this.authorRepository.findOne(input.id);

    if (!authorExist) {
      throw new Error("Author does not exist");
    }

    const updatedAuthor = await this.authorRepository.save({
      id: input.id,
      fullName: input.newName,
    });

    return await this.authorRepository.findOne(updatedAuthor.id);
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
    } catch {
      throw new Error("Somethig went wrong");
    }
    await this.authorRepository.delete(input.id);
    return true;
  }
}
