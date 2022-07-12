import { CustomError } from "./custom.error";

export class UserExistsError extends CustomError {
  constructor() {
    super("User already exists", "USER_EXISTS_ERROR");
  }
}
