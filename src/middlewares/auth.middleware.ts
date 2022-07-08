import { MiddlewareFn, NextFn } from "type-graphql";
import { verify } from "jsonwebtoken";
import { Response, Request } from "express";
import { enviroment } from "../config/enviroment";
import { CustomError } from "../errors/custom.error";

export interface IContex {
  req: Request;
  res: Response;
  payload: { userId: string };
}

export const isAuth: MiddlewareFn<IContex> = ({ context }, next) => {
  try {
    const bearerToken = context.req.headers["authorization"];

    if (!bearerToken) {
      throw new CustomError("User is not authorized", "UNAUTHORIZED");
    }

    const jwt = bearerToken.split(" ")[1];
    const payload = verify(jwt, enviroment.JWT_SECRET);
    context.payload = payload as any;
  } catch (error: any) {
    throw error;
  }

  return next();
};

