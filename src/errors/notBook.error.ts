import { CustomError } from "./custom.error";

export class NotBookError extends CustomError {
  constructor() {
    super("Book doesn't exists", "NOT_BOOK_ERROR");
  }
}
