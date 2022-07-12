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
    if (error.validationErrors) {
      const message = error.validationErrors[0].constraints.isLength;
      throw new ValidationError(message);
    }

    throw error;
  }
};
