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
import { transporter } from "../config/mailer";
import nodemailer from "nodemailer";
import { enviroment } from "../config/enviroment";

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
      const now = new Date();
      console.log(now);
      const book = await this.bookRepository.insert({
        title: input.title,
        author: author,
        isOnLoan: false,
        //   borrowBookDate: now,
        //   returnBookDate: now,
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
        relations: ["author", "author.books", "user"],
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
        relations: ["author", "author.books", "user"],
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

  @Mutation(() => Boolean)
  async borrowBook(
    @Arg("input", () => BorrowBookInput) input: BorrowBookInput
  ): Promise<Boolean | undefined> {
    try {
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
        returnBookDate: addDaysToDate(then, 7),
      });

      return true;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  @Mutation(() => Boolean)
  async returnBook(
    @Arg("input", () => BorrowBookInput) input: BorrowBookInput
  ): Promise<Boolean | undefined> {
    try {
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

      if (user.id !== book.user.id) {
        throw new Error("User does't have this book");
      }

      user.nBooks--;

      await this.userRepository.save({ id: user.id, nBooks: user.nBooks });

      await this.bookRepository.save({
        id: input.bookId,
        isOnLoan: false,
        user: new User(),
        borrowBookDate: undefined,
        returnBookDate: undefined,
      });
      console.log(new User());
      if (!returnBookOnTime(book.returnBookDate)) {
        sendEmailToUser("late", user.email);
      } else {
        sendEmailToUser("onTime", user.email);
      }
      return true;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

const addDaysToDate = (date: Date, days: number) => {
  const res = new Date(date.setDate(date.getDate() + days));
  return res;
};

const returnBookOnTime = (date: Date) => {
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
  console.log(bodyEmail);

  await transporter.sendMail({
    from: '"Library" <' + enviroment.NM_USERNAME + ">", // sender address
    to: userEmail, // list of receivers
    subject: "Library. Book return", // Subject line
    text: bodyEmail, // plain text body
    //  html: "<b>Hello world?</b>", // html body
  });
};
