import dotenv from "dotenv";

// Solo cargar archivos .env en desarrollo local
if (process.env.NODE_ENV !== "production") {
  const envFile = ".env.development";
  dotenv.config({ path: envFile });
}

export const enviroment = {
  PORT: process.env.PORT,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_DATABASE: process.env.DB_DATABASE,
  JWT_SECRET: process.env.JWT_SECRET || "Default",
  CRON_ADMINTIME: process.env.CRON_ADMINTIME || "0 20 * * 7",
  CRON_CHECKBOOKS: process.env.CRON_CHECKBOOKS || "0 8 * * *",
  NM_USERNAME: process.env.NM_USERNAME,
  NM_PASSWORD: process.env.NM_PASSWORD,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
};
