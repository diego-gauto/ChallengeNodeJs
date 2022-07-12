import { CustomError } from "./custom.error";

export class NotUserError extends CustomError {
  constructor() {
    super("User doesn't exists", "NOT_USER_ERROR");
  }
}
