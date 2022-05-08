import { AdminEmitter } from "./admin.event-emitter";

export const launchAdminReportEvent = () => {
  const emitter = AdminEmitter.getInstance();
  emitter.emit("adminReportEvent");
};

export const launchCheckBooksEvent = () => {
  const emitter = AdminEmitter.getInstance();
  emitter.emit("checkBooksEvent");
  console.log("checkBooksEvent emitted");
};
