import { startServer, shutdown } from "./server";
import { connect } from "./config/typeorm";
import logger from "./utils/logger";
import "./cronJobs/admin.cronJob";
import "./cronJobs/books.cronjob";
import { Server } from "http";

async function main() {
  connect();
  const port: number = Number(process.env.PORT);
  const app = await startServer();

  const server: Server = app.listen(port, () =>
    logger.info(`App running on port: ${port}`)
  );

  process.on("uncaughtException", () => {
    shutdown(server, 1);
  });
  process.on("unhandledRejection", () => {
    shutdown(server, 1);
  });
  process.on("SIGTERM", () => {
    shutdown(server, 0);
  });
  process.on("SIGINT", () => {
    shutdown(server, 0);
  });
}

main();
