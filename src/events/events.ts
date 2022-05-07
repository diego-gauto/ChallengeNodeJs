import { sendReportToAdmin } from "../servicies/admin.servicies";
import events from "events";

export const launchAdminReportEvent = () => {
  console.log("Administration Report lunched");

  //const events = require("events");
  const emitter = new events.EventEmitter();

  emitter.on("adminReportEvent", () => {
    sendReportToAdmin();
  });

  emitter.emit("adminReportEvent");
};