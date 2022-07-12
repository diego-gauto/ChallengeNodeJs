import { CustomError } from "./custom.error";

export class NotUserBookError extends CustomError {
  constructor() {
    super("User haven't the book", "BORROW_BOOK_ERROR");
  }
}
