import { Arg, Mutation, Resolver, Query, UseMiddleware } from "type-graphql";
import { getRepository, Repository } from "typeorm";
import { isAuth } from "../middlewares/auth.middleware";
import { Book } from "../entity/book.entity";
import { Author } from "../entity/author.entity";
import { User } from "../entity/user.entity";
import {
  BookIdInput,
  BookInput,
  BookUpdateInput,
  BorrowBookInput,
} from "../dto/book.dto";
import {
  borrowBook,
  createBook,
  deleteBook,
  getAllAvailibleBooks,
  getAllBooks,
  getBook,
  returnBook,
  updateBook,
} from "../servicies/book.servicies";

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
    return await createBook(input, this.authorRepository, this.bookRepository);
  }

  @Query(() => [Book])
  @UseMiddleware(isAuth)
  async getAllBooks(): Promise<Book[]> {
    return await getAllBooks(this.bookRepository);
  }

  @Query(() => [Book])
  @UseMiddleware(isAuth)
  async getAllAvailibleBooks(): Promise<Book[]> {
    return await getAllAvailibleBooks(this.bookRepository);
  }

  @Query(() => Book)
  @UseMiddleware(isAuth)
  async getBookById(
    @Arg("input", () => BookIdInput) input: BookIdInput
  ): Promise<Book | undefined> {
    return await getBook(input, this.bookRepository);
  }

  @Mutation(() => Book)
  @UseMiddleware(isAuth)
  async updateBookById(
    @Arg("input", () => BookUpdateInput) input: BookUpdateInput
  ): Promise<Book | undefined> {
    return await updateBook(input, this.bookRepository, this.authorRepository);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteBookById(
    @Arg("input", () => BookIdInput) input: BookIdInput
  ): Promise<Boolean> {
    return await deleteBook(input, this.bookRepository);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async borrowBook(
    @Arg("input", () => BorrowBookInput) input: BorrowBookInput
  ): Promise<Boolean | undefined> {
    return await borrowBook(input, this.bookRepository, this.userRepository);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async returnBook(
    @Arg("input", () => BorrowBookInput) input: BorrowBookInput
  ): Promise<Boolean | undefined> {
    return await returnBook(input, this.bookRepository, this.userRepository);
  }
}
