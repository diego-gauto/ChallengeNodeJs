import { getRepository, Repository, getConnection } from "typeorm";
import {
  BookIdInput,
  BookInput,
  BookUpdateInput,
  BorrowBookInput,
} from "./book.dto";
import { Author } from "../author/author.entity";
import { Book } from "./book.entity";
import { User } from "../user/user.entity";
import { enviroment } from "../config/enviroment";
import { transporter } from "../config/mailer";
import { CustomError } from "../errors/custom.error";
import { addDaysToDate, returnBookOnTime } from "../utils/utils";

export default class BookServices {
  private authorRepository: Repository<Author>;
  private userRepository: Repository<User>;
  private bookRepository: Repository<Book>;

  constructor() {
    this.authorRepository = getRepository(Author);
    this.userRepository = getRepository(User);
    this.bookRepository = getRepository(Book);
  }

  createBook = async (input: BookInput) => {
    const author: Author | undefined = await this.authorRepository.findOne(
      input.authorId
    );
    if (!author)
      throw new CustomError(
        "The author for this book does not exist. Please check it",
        "BAD_USER_INPUT"
      );

    const book = await this.bookRepository.insert({
      title: input.title,
      author: author,
      isOnLoan: false,
    });

    return await this.bookRepository.findOne(book.identifiers[0].id, {
      relations: ["author", "author.books"],
    });
  };

  getAllBooks = async () => {
    return await this.bookRepository.find({
      relations: ["author", "author.books", "user"],
    });
  };

  getAllAvailibleBooks = async () => {
    return await this.bookRepository.find({
      where: { isOnLoan: false },
      relations: ["author", "author.books", "user"],
    });
  };

  getBook = async (input: BookIdInput) => {
    const book = await this.bookRepository.findOne(input.bookId, {
      relations: ["author", "author.books"],
    });

    if (!book) throw new CustomError("Book does not exist", "BAD_USER_INPUT");

    return book;
  };

  updateBook = async (input: BookUpdateInput) => {
    const bookExist = await this.bookRepository.findOne(input.id);

    if (!bookExist)
      throw new CustomError("Book does not exist", "BAD_USER_INPUT");

    const authorExist = await this.authorRepository.findOne(input.newAuthor);

    if (!authorExist)
      throw new CustomError("Author does not exist", "BAD_USER_INPUT");

    const updatedBook = await this.bookRepository.save({
      id: input.id,
      title: input.newTitle,
      author: authorExist,
    });

    return await this.bookRepository.findOne(updatedBook.id);
  };

  deleteBook = async (input: BookIdInput) => {
    const result = await this.bookRepository.delete(input.bookId);

    if (result.affected === 0)
      throw new CustomError("Book does not exist", "BAD_USER_INPUT");

    return true;
  };

  borrowBook = async (input: BorrowBookInput) => {
    const book = await this.bookRepository.findOne(input.bookId);

    if (!book) {
      throw new CustomError("Book does not exist", "BAD_USER_INPUT");
    }

    const user = await this.userRepository.findOne(input.userId);

    if (!user) {
      throw new CustomError("User does not exist", "BAD_USER_INPUT");
    }

    if (book.isOnLoan) {
      throw new CustomError("Book is allready borrow", "BAD_USER_INPUT");
    }

    if (user.nBooks >= 3) {
      throw new CustomError(
        "User can't take off another book",
        "BAD_USER_INPUT"
      );
    }

    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      user.nBooks++;
      await this.userRepository.save({ id: user.id, nBooks: user.nBooks });

      const now = new Date();
      const then = new Date();

      await this.bookRepository.save({
        id: input.bookId,
        isOnLoan: true,
        user: user,
        borrowBookDate: now,
        returnBookDate: addDaysToDate(then, 7),
      });
      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  };

  returnBook = async (input: BorrowBookInput) => {
    const book = await this.bookRepository.findOne(input.bookId, {
      relations: ["user"],
    });

    if (!book) {
      throw new CustomError("Book does not exist", "BAD_USER_INPUT");
    }

    const user = await this.userRepository.findOne(input.userId);

    if (!user) {
      throw new CustomError("User does not exist", "BAD_USER_INPUT");
    }

    if (!book.isOnLoan) {
      throw new CustomError("Book is not borrow", "BAD_USER_INPUT");
    }

    if (user.id !== book.user?.id) {
      throw new CustomError("User does't have this book", "BAD_USER_INPUT");
    }

    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      user.nBooks--;
      await this.userRepository.save({ id: user.id, nBooks: user.nBooks });

      book.isOnLoan = false;
      book.user = null;
      book.borrowBookDate = undefined;
      await this.bookRepository.save(book);

      this.sendEmailToUser(book.returnBookDate, user.email);
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  };

  private sendEmailToUser = async (returnBookDate: Date, userEmail: string) => {
    let bodyEmail: string = "";

    if (returnBookOnTime(returnBookDate)) {
      bodyEmail =
        "You have returned the book late. For that you should pay a fine";
    } else {
      bodyEmail = "You have returned the book on time";
    }

    await transporter.sendMail({
      from: '"Library" <' + enviroment.NM_USERNAME + ">",
      to: userEmail,
      subject: "Library. Book return",
      text: bodyEmail,
    });
  };
}
