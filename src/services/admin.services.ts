import { getRepository } from "typeorm";
import { enviroment } from "../config/enviroment";
import { transporter } from "../config/mailer";
import { Book } from "../entity/book.entity";
import logger from "../utils/logger/logger";
import { returnBookOnTime } from "./utils/utils";

export const sendReportToAdmin = async () => {
  let bodyEmail = `Los libros que estan disponibles son:\n`;

  const availableBooks = await getRepository(Book)
    .createQueryBuilder("book")
    .select(["book.id", "book.title"])
    .where("book.isOnLoan = :value", { value: false })
    .getMany();

  for (let book of availableBooks) {
    bodyEmail += `ID:${book.id} Title:${book.title}\n`;
  }

  const borrowBooks = await getRepository(Book)
    .createQueryBuilder("book")
    .select(["book.id", "book.title", "book.returnBookDate"])
    .where("book.isOnLoan = :value", { value: true })
    .getMany();

  let bodyEmailBooksOnTime = `\nLos libros que estan prestados, a tiempo de devolverlos son:\n`;
  let bodyEmailBooksOnPenalization = `\nLos libros que estan prestados en penalizacion son:\n`;

  for (let book of borrowBooks) {
    if (returnBookOnTime(book.returnBookDate)) {
      bodyEmailBooksOnTime += `ID:${book.id} Title:${book.title}\n`;
    } else {
      bodyEmailBooksOnPenalization += `ID:${book.id} Title:${book.title}\n`;
    }
  }

  bodyEmail += bodyEmailBooksOnTime + bodyEmailBooksOnPenalization;

  await transporter.sendMail({
    from: '"Library" <' + enviroment.NM_USERNAME + ">",
    to: enviroment.ADMIN_EMAIL,
    subject: "Library. Books report",
    text: bodyEmail,
  });
  logger.info("Report sent to Administration");
};

export const sendEmailToUsers = async () => {
  const borrowBooks = await getRepository(Book)
    .createQueryBuilder("book")
    .select(["book.id", "book.title", "book.returnBookDate", "user.email"])
    .leftJoinAndSelect("book.user", "user")
    .where("book.isOnLoan = :value", { value: true })
    .getMany();

  logger.info(borrowBooks);

  for (let book of borrowBooks) {
    let bodyEmail = "";
    if (!returnBookOnTime(book.returnBookDate)) {
      bodyEmail += `El libro, ID:${book.id} Title:${book.title} entro en penalizacion. Debera pagar una multa por devolverlo fuera de termino`;
    }

    await transporter.sendMail({
      from: '"Library" <' + enviroment.NM_USERNAME + ">",
      to: book.user?.email,
      subject: "Library. Book on penalty",
      text: bodyEmail,
    });
  }
  logger.info("E-mails sent to users");
};
