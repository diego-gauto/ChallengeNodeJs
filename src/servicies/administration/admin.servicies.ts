import { enviroment } from "../../config/enviroment";
import { Client } from "pg";

export const sendReportToAdmin = async () => {
  //const client = new Client();

  const client = new Client({
    host: enviroment.DB_HOST,
    user: enviroment.DB_USERNAME,
    password: enviroment.DB_PASSWORD,
    database: enviroment.DB_DATABASE,
  });
  await client.connect();
  const res = await client.query("SELECT * FROM book");
  console.log(res.rows);
  await client.end();
  console.log("email sended to Admin");
};
