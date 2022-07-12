import { CustomError } from "./custom.error";

export class UnauthenticatedError extends CustomError {
  constructor() {
    super("Invalid credential", "UNAUTHENTICATED");
  }
}
