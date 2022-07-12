import { Connection, createConnection, getConnection } from "typeorm";
import path from "path";
import { enviroment } from "./enviroment";
import logger from "../utils/logger";

export async function connect() {
  await createConnection({
    type: "postgres",
    port: Number(enviroment.DB_PORT),
    username: enviroment.DB_USERNAME,
    password: enviroment.DB_PASSWORD,
    database: enviroment.DB_DATABASE,
    entities: [path.join(__dirname, "../*/*.entity.ts")],
    synchronize: true,
  });
  logger.info("Database running");
}

export async function closeDBConnection() {
  const connection: Connection = getConnection();

  try {
    await connection.close();
    logger.info("connection to the database could be closed");
  } catch (error) {
    logger.error("connection to the database could not be closed");
    throw error;
  }
}
