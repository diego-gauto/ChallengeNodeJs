import { CustomError } from "./custom.error";

export class UnauthorizedError extends CustomError {
  constructor() {
    super("User is not authorized", "UNAUTHORIZED");
  }
}
