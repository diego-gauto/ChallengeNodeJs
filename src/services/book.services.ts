import { getRepository, Repository } from "typeorm";
import { Client } from "pg";
import {
  BookIdInput,
  BookInput,
  BookUpdateInput,
  BorrowBookInput,
} from "../dto/book.dto";
import { Author } from "../entity/author.entity";
import { Book } from "../entity/book.entity";
import { User } from "../entity/user.entity";
import { enviroment } from "../config/enviroment";
import { transporter } from "../config/mailer";
import { CustomError } from "../errors/custom.error";

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
      throw new Error("Book does not exist");
    }

    const user = await this.userRepository.findOne(input.userId);

    if (!user) {
      throw new Error("User does not exist");
    }

    if (book.isOnLoan) {
      throw new Error("Book is allready borrow");
    }

    if (user.nBooks >= 3) {
      throw new Error("User can't take off another book");
    }

    user.nBooks++;
    await this.userRepository.save({ id: user.id, nBooks: user.nBooks });

    const now = new Date();
    const then = new Date();

    await this.bookRepository.save({
      id: input.bookId,
      isOnLoan: true,
      user: user,
      borrowBookDate: now,
      returnBookDate: this.addDaysToDate(then, 7),
    });

    return true;
  };

  returnBook = async (input: BorrowBookInput) => {
    const book = await this.bookRepository.findOne(input.bookId, {
      relations: ["user"],
    });

    if (!book) {
      throw new Error("Book does not exist");
    }

    const user = await this.userRepository.findOne(input.userId);

    if (!user) {
      throw new Error("User does not exist");
    }

    if (!book.isOnLoan) {
      throw new Error("Book is not borrow");
    }

    if (user.id !== book.user?.id) {
      throw new Error("User does't have this book");
    }

    user.nBooks--;
    await this.userRepository.save({ id: user.id, nBooks: user.nBooks });

    book.isOnLoan = false;
    book.user = null;
    await this.bookRepository.save(book);

    if (!this.returnBookOnTime(book.returnBookDate)) {
      this.sendEmailToUser("late", user.email);
    } else {
      this.sendEmailToUser("onTime", user.email);
    }
    return true;
  };

  private addDaysToDate = (date: Date, days: number) => {
    const res = new Date(date.setDate(date.getDate() + days));
    return res;
  };

  public returnBookOnTime = (date: Date) => {
    const returnBookDate = date.getTime();
    const now = new Date().getTime();
    let res = true;

    if (now - returnBookDate > 0) {
      res = false;
    }

    return res;
  };

  private sendEmailToUser = async (input: string, userEmail: string) => {
    let bodyEmail: any = "";

    if (input === "late") {
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

  private sendEmailToUsers = async () => {
    //const client = new Client();
    console.log("preparing emails");
    const client = new Client({
      host: enviroment.DB_HOST,
      user: enviroment.DB_USERNAME,
      password: enviroment.DB_PASSWORD,
      database: enviroment.DB_DATABASE,
    });
    await client.connect();

    const res = await client.query(
      'SELECT book.id,title,"returnBookDate","user".email FROM book INNER JOIN "user" ON "userId"="user".id where "isOnLoan"=true'
    );
    console.log(res.rows);
    for (let book of res.rows) {
      let bodyEmail = "";
      if (!this.returnBookOnTime(book.returnBookDate)) {
        bodyEmail += `El libro, ID:${book.id} Title:${book.title} entro en penalizacion. Debera pagar una multa por devolverlo fuera de termino`;
      }

      await transporter.sendMail({
        from: '"Library" <' + enviroment.NM_USERNAME + ">",
        to: book.email,
        subject: "Library. Book on penalty",
        text: bodyEmail,
      });
    }
    await client.end();
  };
}
