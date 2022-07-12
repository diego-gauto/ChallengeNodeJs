import express from "express";
import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { BookResolver } from "./book/book.resolver";
import { AuthorResolver } from "./author/author.resolver";
import { AuthResolver } from "./user/auth.resolver";
import { registerCheckBooks, registerAdminReport } from "./events/handler";
import { ErrorInterceptor } from "./middlewares/error.middleware";
import { Server } from "http";
import logger from "./utils/logger";
import { closeDBConnection } from "./config/typeorm";
import { ValidateInput } from "./middlewares/validation.middleware";
import { getConnection } from "typeorm";

export async function startServer() {
  const app = express();

  const apolloserver = new ApolloServer({
    schema: await buildSchema({
      resolvers: [BookResolver, AuthorResolver, AuthResolver],
      globalMiddlewares: [ErrorInterceptor, ValidateInput],
    }),
    context: ({ req, res }) => ({ req, res }),
    formatError: (err) => {
      return { message: err.message, statusCode: err.extensions.code };
    },
  });

  await apolloserver.start();

  apolloserver.applyMiddleware({ app, path: "/graphql" });

  registerAdminReport();
  registerCheckBooks();

  return app;
}

export const shutdown = async (server: Server, exitCode: number) => {
  if (exitCode === 1) logger.error("Ungracefully stopping process");
  if (exitCode === 0) logger.error("Gracefully stopping process");
  await closeDBConnection();
  server.close(() => {
    logger.info("HTTP server closed");
  });

  setTimeout(process.exit(exitCode), 1000);
};
