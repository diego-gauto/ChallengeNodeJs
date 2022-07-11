import { enviroment } from "../config/enviroment";
import { launchAdminReportEvent } from "../events/events";
import adminCronJob from "node-cron";
import logger from "../utils/logger";

adminCronJob.schedule(enviroment.CRON_ADMINTIME, () => {
  logger.info("adminReportEvent launched");
  launchAdminReportEvent();
});
