import { MiddlewareFn } from "type-graphql";
import { ValidationError } from "../errors/validation.error";
import logger from "../utils/logger";

export const ValidateInput: MiddlewareFn<any> = async (
  { context, info },
  next
) => {
  try {
    return await next();
  } catch (error: any) {
    logger.info("dentro de validation error");
    logger.info(error.validationErrors[0].constraints);
    if (error.validationErrors) {
      const message = error.validationErrors[0].constraints.isLength;
      logger.error(message);
      throw new ValidationError(message);
    }

    throw error;
  }
};
