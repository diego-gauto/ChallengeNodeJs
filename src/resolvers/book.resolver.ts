import {
  Arg,
  Mutation,
  Resolver,
  InputType,
  Field,
  Query,
  UseMiddleware,
} from "type-graphql";
import { Book } from "../entity/book.entity";
import { getRepository, Repository } from "typeorm";
import { Author } from "../entity/author.entity";
import { Length } from "class-validator";
import { isAuth } from "../middlewares/auth.middleware";
import { User } from "../entity/user.entity";

@InputType()
class BookInput {
  @Field()
  @Length(3, 20)
  title!: string;

  @Field()
  authorId!: number;
}

@InputType()
class BookIdInput {
  @Field()
  bookId!: number;
}

@InputType()
class BookUpdateInput {
  @Field()
  id!: number;

  @Field(() => String, { nullable: true })
  @Length(3, 20)
  newTitle?: string;

  @Field(() => Number, { nullable: true })
  newAuthor?: number;
}

@InputType()
class BorrowBookInput {
  @Field()
  bookId!: number;

  @Field(() => Number)
  userId!: number;
}

@Resolver()
export class BookResolver {
  bookRepository: Repository<Book>;
  authorRepository: Repository<Author>;
  userRepository: Repository<User>;

  constructor() {
    this.bookRepository = getRepository(Book);
    this.authorRepository = getRepository(Author);
    this.userRepository = getRepository(User);
  }

  @Mutation(() => Book)
  @UseMiddleware(isAuth)
  async createBook(@Arg("input", () => BookInput) input: BookInput) {
    try {
      const author: Author | undefined = await this.authorRepository.findOne(
        input.authorId
      );
      if (!author) {
        const error = new Error();
        error.message =
          "The author for this book does not existe. Please check it";
        throw error;
      }
      const book = await this.bookRepository.insert({
        title: input.title,
        author: author,
        isOnLoan: false,
      });
      return await this.bookRepository.findOne(book.identifiers[0].id, {
        relations: ["author", "author.books"],
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  @Query(() => [Book])
  @UseMiddleware(isAuth)
  async getAllBooks(): Promise<Book[]> {
    try {
      return await this.bookRepository.find({
        relations: ["author", "author.books"],
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  @Query(() => [Book])
  @UseMiddleware(isAuth)
  async getAllAvailibleBooks(): Promise<Book[]> {
    try {
      return await this.bookRepository.find({
        where: { isOnLoan: false },
        relations: ["author", "author.books"],
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  @Query(() => Book)
  async getBookById(
    @Arg("input", () => BookIdInput) input: BookIdInput
  ): Promise<Book | undefined> {
    try {
      const book = await this.bookRepository.findOne(input.bookId, {
        relations: ["author", "author.books"],
      });
      if (!book) {
        const error = new Error();
        error.message = "Book does not exist";
        throw error;
      }
      return book;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  @Mutation(() => Book)
  async updateBookById(
    @Arg("input", () => BookUpdateInput) input: BookUpdateInput
  ): Promise<Book | undefined> {
    try {
      const bookExist = await this.bookRepository.findOne(input.id);

      if (!bookExist) {
        throw new Error("Book does not exist");
      }

      const authorExist = await this.authorRepository.findOne(input.newAuthor);

      if (!authorExist) {
        throw new Error("Author does not exist");
      }
      const updatedBook = await this.bookRepository.save({
        id: input.id,
        title: input.newTitle,
        author: authorExist,
      });

      return await this.bookRepository.findOne(updatedBook.id);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  @Mutation(() => Boolean)
  async deleteBookById(
    @Arg("input", () => BookIdInput) input: BookIdInput
  ): Promise<Boolean> {
    try {
      const result = await this.bookRepository.delete(input.bookId);

      if (result.affected === 0) throw new Error("Book does not exist");

      return true;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  @Mutation(() => Book)
  async borrowBookById(
    @Arg("input", () => BorrowBookInput) input: BorrowBookInput
  ): Promise<Book | undefined> {
    try {
      const book = await this.bookRepository.findOne(input.bookId);

      if (!book) {
        throw new Error("Book does not exist");
      }

      const userExist = await this.userRepository.findOne(input.userId);

      if (!userExist) {
        throw new Error("User does not exist");
      }

      if (book.isOnLoan) {
        throw new Error("Book is allready borrow");
      }
      const borrowedBook = await this.bookRepository.save({
        id: input.bookId,
        isOnLoan: true,
      });

      return await this.bookRepository.findOne(borrowedBook.id);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
