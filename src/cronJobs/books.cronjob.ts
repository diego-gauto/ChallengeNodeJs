import { enviroment } from "../config/enviroment";
import { launchCheckBooksEvent } from "../events/events";
import logger from "../utils/logger";
import checkBooksCronJob from "node-cron";

checkBooksCronJob.schedule(enviroment.CRON_CHECKBOOKS, () => {
  logger.info("checkBookEvent launched");
  launchCheckBooksEvent();
});
