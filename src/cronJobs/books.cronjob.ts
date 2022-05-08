import { enviroment } from "../config/enviroment";
import { launchCheckBooksEvent } from "../events/events";
import checkBooksCronJob from "node-cron";

checkBooksCronJob.schedule(enviroment.CRON_CHECKBOOKS, () => {
  console.log("checkBookEvent launched");
  launchCheckBooksEvent();
});
