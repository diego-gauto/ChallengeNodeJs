import { AdminEmitter } from "./admin.event-emitter";
import { sendReportToAdmin } from "../servicies/admin.servicies";
import { sendEmailToUsers } from "../servicies/book.servicies";

export const registerAdminReport = () => {
  const emitter = AdminEmitter.getInstance();

  emitter.on("adminReportEvent", sendReportToAdmin);
};

export const registerCheckBooks = () => {
  const emitter = AdminEmitter.getInstance();

  emitter.on("checkBooksEvent", sendEmailToUsers);
};
