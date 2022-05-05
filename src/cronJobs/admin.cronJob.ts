import { enviroment } from "../config/enviroment";
import { launchAdminReportEvent } from "../events/events";

const adminCronJob = require("node-cron");

adminCronJob.schedule(enviroment.CRON_ADMINTIME, () => {
  launchAdminReportEvent();
});
