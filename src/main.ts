import { startServer } from "./server";
import { connect } from "./config/typeorm";
import logger from "./utils/logger/logger";
import "./cronJobs/admin.cronJob";
import "./cronJobs/books.cronjob";

async function main() {
  connect();
  const port: number = Number(process.env.PORT);
  const app = await startServer();

  app.listen(port, () => logger.info(`App running on port: ${port}`));
}

main();
