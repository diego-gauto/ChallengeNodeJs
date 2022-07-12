import { MiddlewareFn } from "type-graphql";
import { CustomError } from "../errors/custom.error";
import logger from "../utils/logger";

export const ErrorInterceptor: MiddlewareFn<any> = async (
  { context, info },
  next
) => {
  try {
    return await next();
  } catch (err: any) {
    logger.info(err);
    logger.info(err instanceof CustomError);
    if (!(err instanceof CustomError)) {
      logger.fatal("Critical error");
      throw new CustomError("Houston, We have a problem...", "CRITICAL_ERROR");
    }

    logger.error(err.message);
    throw err;
  }
};
