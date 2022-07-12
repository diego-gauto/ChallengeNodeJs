import { CustomError } from "./custom.error";

export class NotAuthorError extends CustomError {
  constructor() {
    super("Author doesn't exists", "NOT_AUTHOR_ERROR");
  }
}
