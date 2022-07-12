import { CustomError } from "./custom.error";

export class BorrowBookError extends CustomError {
  constructor() {
    super("Book is allready borrow", "BORROW_BOOK_ERROR");
  }
}
