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
    host: enviroment.DB_HOST,
    // Configuración condicional según entorno
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: true }
        : false,
    synchronize: process.env.NODE_ENV !== "production",
  });
  logger.info("Database running");
}

export const closeDBConnection = async () => {
  try {
    logger.info("Preparing to close DB connection");
    const connection: Connection = getConnection();
    logger.info("Get connection");
    await connection.close(); // TODO: Only close if its opened
    logger.info("connection to the database could be closed");
  } catch (error) {
    logger.error("connection to the database could not be closed");
    throw error;
  }
};
