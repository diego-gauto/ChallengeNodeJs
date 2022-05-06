import { enviroment } from "../../config/enviroment";
import { Client } from "pg";
import { returnBookOnTime } from "../../resolvers/book.resolver";
import { transporter } from "../../config/mailer";

export const sendReportToAdmin = async () => {
  //const client = new Client();

  const client = new Client({
    host: enviroment.DB_HOST,
    user: enviroment.DB_USERNAME,
    password: enviroment.DB_PASSWORD,
    database: enviroment.DB_DATABASE,
  });

  let bodyEmail = `Los libros que estan disponibles son:\n`;

  await client.connect();
  let res = await client.query('SELECT * FROM book WHERE "isOnLoan"=false');

  for (let book of res.rows) {
    bodyEmail += `ID:${book.id} Title:${book.title}\n`;
  }

  res = await client.query('SELECT * FROM book WHERE "isOnLoan"=true');
  bodyEmail += `\nLos libros que estan prestados, a tiempo de devolverlos son:\n`;

  for (let book of res.rows) {
    if (returnBookOnTime(book.returnBookDate)) {
      bodyEmail += `ID:${book.id} Title:${book.title}\n`;
    }
  }

  bodyEmail += `\nLos libros que estan prestados en penalizacion son:\n`;

  for (let book of res.rows) {
    if (!returnBookOnTime(book.returnBookDate)) {
      bodyEmail += `ID:${book.id} Title:${book.title}\n`;
    }
  }
  await client.end();

  await transporter.sendMail({
    from: '"Library" <' + enviroment.NM_USERNAME + ">", // sender address
    to: enviroment.ADMIN_EMAIL, // list of receivers
    subject: "Library. Book return", // Subject line
    text: bodyEmail, // plain text body
    //  html: "<b>Hello world?</b>", // html body
  });

  console.log(bodyEmail);
  console.log("email sended to Admin");
};
