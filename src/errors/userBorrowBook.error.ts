import { CustomError } from "./custom.error";

export class UserBorrowBookError extends CustomError {
  constructor() {
    super("User can't take off another book", "BORROW_BOOK_ERROR");
  }
}
