import { enviroment } from "../config/enviroment";
import { launchAdminReportEvent } from "../events/events";
import adminCronJob from "node-cron";

adminCronJob.schedule(enviroment.CRON_ADMINTIME, () => {
  launchAdminReportEvent();
});
