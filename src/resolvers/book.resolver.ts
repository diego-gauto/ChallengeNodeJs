import { Arg, Mutation, Resolver, Query, UseMiddleware } from "type-graphql";
import { isAuth } from "../middlewares/auth.middleware";
import { Book } from "../entity/book.entity";
import {
  BookIdInput,
  BookInput,
  BookUpdateInput,
  BorrowBookInput,
} from "../dto/book.dto";
import BookServices from "../services/book.services";

@Resolver()
export class BookResolver {
  private bookServices: BookServices;

  constructor() {
    this.bookServices = new BookServices();
  }

  @Mutation(() => Book)
  @UseMiddleware(isAuth)
  async createBook(@Arg("input", () => BookInput) input: BookInput) {
    return await this.bookServices.createBook(input);
  }

  @Query(() => [Book])
  @UseMiddleware(isAuth)
  async getAllBooks(): Promise<Book[]> {
    return await this.bookServices.getAllBooks();
  }

  @Query(() => [Book])
  @UseMiddleware(isAuth)
  async getAllAvailibleBooks(): Promise<Book[]> {
    return await this.bookServices.getAllAvailibleBooks();
  }

  @Query(() => Book)
  @UseMiddleware(isAuth)
  async getBookById(
    @Arg("input", () => BookIdInput) input: BookIdInput
  ): Promise<Book | undefined> {
    return await this.bookServices.getBook(input);
  }

  @Mutation(() => Book)
  @UseMiddleware(isAuth)
  async updateBookById(
    @Arg("input", () => BookUpdateInput) input: BookUpdateInput
  ): Promise<Book | undefined> {
    return await this.bookServices.updateBook(input);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteBookById(
    @Arg("input", () => BookIdInput) input: BookIdInput
  ): Promise<Boolean> {
    return await this.bookServices.deleteBook(input);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async borrowBook(
    @Arg("input", () => BorrowBookInput) input: BorrowBookInput
  ): Promise<Boolean | undefined> {
    return await this.bookServices.borrowBook(input);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async returnBook(
    @Arg("input", () => BorrowBookInput) input: BorrowBookInput
  ): Promise<Boolean | undefined> {
    return await this.bookServices.returnBook(input);
  }
}
