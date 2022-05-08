import { Repository } from "typeorm";
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

export const createBook = async (
  input: BookInput,
  authorRepository: Repository<Author>,
  bookRepository: Repository<Book>
) => {
  try {
    const author: Author | undefined = await authorRepository.findOne(
      input.authorId
    );
    if (!author) {
      const error = new Error();
      error.message =
        "The author for this book does not existe. Please check it";
      throw error;
    }
    const book = await bookRepository.insert({
      title: input.title,
      author: author,
      isOnLoan: false,
    });

    return await bookRepository.findOne(book.identifiers[0].id, {
      relations: ["author", "author.books"],
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getAllBooks = async (bookRepository: Repository<Book>) => {
  try {
    return await bookRepository.find({
      relations: ["author", "author.books", "user"],
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getAllAvailibleBooks = async (
  bookRepository: Repository<Book>
) => {
  try {
    return await bookRepository.find({
      where: { isOnLoan: false },
      relations: ["author", "author.books", "user"],
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getBook = async (
  input: BookIdInput,
  bookRepository: Repository<Book>
) => {
  try {
    const book = await bookRepository.findOne(input.bookId, {
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
};

export const updateBook = async (
  input: BookUpdateInput,
  bookRepository: Repository<Book>,
  authorRepository: Repository<Author>
) => {
  try {
    const bookExist = await bookRepository.findOne(input.id);

    if (!bookExist) {
      throw new Error("Book does not exist");
    }

    const authorExist = await authorRepository.findOne(input.newAuthor);

    if (!authorExist) {
      throw new Error("Author does not exist");
    }
    const updatedBook = await bookRepository.save({
      id: input.id,
      title: input.newTitle,
      author: authorExist,
    });

    return await bookRepository.findOne(updatedBook.id);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const deleteBook = async (
  input: BookIdInput,
  bookRepository: Repository<Book>
) => {
  try {
    const result = await bookRepository.delete(input.bookId);

    if (result.affected === 0) throw new Error("Book does not exist");

    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const borrowBook = async (
  input: BorrowBookInput,
  bookRepository: Repository<Book>,
  userRepository: Repository<User>
) => {
  try {
    const book = await bookRepository.findOne(input.bookId);

    if (!book) {
      throw new Error("Book does not exist");
    }

    const user = await userRepository.findOne(input.userId);

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
    await userRepository.save({ id: user.id, nBooks: user.nBooks });

    const now = new Date();
    const then = new Date();

    await bookRepository.save({
      id: input.bookId,
      isOnLoan: true,
      user: user,
      borrowBookDate: now,
      returnBookDate: addDaysToDate(then, 7),
    });

    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const returnBook = async (
  input: BorrowBookInput,
  bookRepository: Repository<Book>,
  userRepository: Repository<User>
) => {
  try {
    const book = await bookRepository.findOne(input.bookId, {
      relations: ["user"],
    });

    if (!book) {
      throw new Error("Book does not exist");
    }

    const user = await userRepository.findOne(input.userId);

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
    await userRepository.save({ id: user.id, nBooks: user.nBooks });

    book.isOnLoan = false;
    book.user = null;
    await bookRepository.save(book);

    if (!returnBookOnTime(book.returnBookDate)) {
      sendEmailToUser("late", user.email);
    } else {
      sendEmailToUser("onTime", user.email);
    }
    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const addDaysToDate = (date: Date, days: number) => {
  const res = new Date(date.setDate(date.getDate() + days));
  return res;
};

export const returnBookOnTime = (date: Date) => {
  const returnBookDate = date.getTime();
  const now = new Date().getTime();
  let res = true;

  if (now - returnBookDate > 0) {
    res = false;
  }

  return res;
};

const sendEmailToUser = async (input: string, userEmail: string) => {
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

export const sendEmailToUsers = async () => {
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
    if (!returnBookOnTime(book.returnBookDate)) {
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
