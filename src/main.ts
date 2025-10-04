import { startServer, shutdown } from "./server";
import { connect } from "./config/typeorm";
import logger from "./utils/logger";
import "./cronJobs/admin.cronJob";
import "./cronJobs/books.cronjob";
import { Server } from "http";

process.on("uncaughtException", (err) => {});
process.on("unhandledRejection", (reason, promise) => {});

async function main() {
  try {
    await connect();
    const port: number = Number(process.env.PORT);
    const app = await startServer();

    const server: Server = app.listen(port, () =>
      logger.info(`App running on port: ${port}`)
    );

    process.on("uncaughtException", (err) => {
      logger.error("uncaughtException", err);
      shutdown(server, 1);
    });

    process.on("unhandledRejection", (reason) => {
      logger.error("unhandledRejection", reason);
      shutdown(server, 1);
    });

    process.on("SIGTERM", () => {
      shutdown(server, 0);
    });

    process.on("SIGINT", () => {
      shutdown(server, 0);
    });
  } catch (err) {
    logger.error("Error on server startup", err);
    process.exit(1);
  }
}

main();
