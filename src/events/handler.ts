import { AdminEmitter } from "./admin.event-emitter";
import { sendReportToAdmin } from "../services/admin.services";
import { sendEmailToUsers } from "../services/book.services";

export const registerAdminReport = () => {
  const emitter = AdminEmitter.getInstance();

  emitter.on("adminReportEvent", sendReportToAdmin);
};

export const registerCheckBooks = () => {
  const emitter = AdminEmitter.getInstance();

  emitter.on("checkBooksEvent", sendEmailToUsers);
};
