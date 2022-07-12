import { MiddlewareFn } from "type-graphql";
import { verify } from "jsonwebtoken";
import { Response, Request } from "express";
import { enviroment } from "../config/enviroment";
import { CustomError } from "../errors/custom.error";
import { UnauthorizedError } from "../errors/unauthorized.error";

export interface IContex {
  req: Request;
  res: Response;
  payload: { userId: string };
}

export const isAuth: MiddlewareFn<IContex> = ({ context }, next) => {
  try {
    const bearerToken = context.req.headers["authorization"];

    if (!bearerToken) {
      throw new UnauthorizedError();
    }

    const jwt = bearerToken.split(" ")[1];
    const payload = verify(jwt, enviroment.JWT_SECRET);
    context.payload = payload as any;
  } catch (error: any) {
    throw error;
  }

  return next();
};
