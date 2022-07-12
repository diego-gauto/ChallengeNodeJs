import { MiddlewareFn } from "type-graphql";
import { CriticalError } from "../errors/critical.error";
import { CustomError } from "../errors/custom.error";

export const ErrorInterceptor: MiddlewareFn<any> = async (
  { context, info },
  next
) => {
  try {
    return await next();
  } catch (err: any) {
    if (!(err instanceof CustomError)) {
      throw new CriticalError();
    }
    throw err;
  }
};
