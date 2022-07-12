import { CustomError } from "./custom.error";

export class CriticalError extends CustomError {
  constructor() {
    super("Houston, We have a problem...", "CRITICAL_ERROR");
  }
}
