import { CustomError } from "./custom.error";

export class NotBorrowBookError extends CustomError {
  constructor() {
    super("Book is not borrow", "BORROW_BOOK_ERROR");
  }
}
