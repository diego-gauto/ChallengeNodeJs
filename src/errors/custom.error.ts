import { ApolloError } from "apollo-server-errors";

export class CustomError extends ApolloError {
  constructor(message: string, errorCode: string) {
    super(message, errorCode);

    Object.defineProperty(this, "name", { value: "MyError" });
  }
}
