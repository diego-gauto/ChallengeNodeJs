import { CustomError } from "./custom.error";

export class DeleteAuthorError extends CustomError {
  constructor() {
    super("Author can't delete. Has a borrow book", "DELETE_AUTHOR_ERROR");
  }
}
