import express from "express";
import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { BookResolver } from "./resolvers/book.resolver";
import { AuthorResolver } from "./resolvers/author.resolver";
import { AuthResolver } from "./resolvers/auth.resolver";
import { registerCheckBooks, registerAdminReport } from "./events/handler";
import { ErrorInterceptor } from "./middlewares/error.middleware";

export async function startServer() {
  const app = express();

  const apolloserver = new ApolloServer({
    schema: await buildSchema({
      resolvers: [BookResolver, AuthorResolver, AuthResolver],
      globalMiddlewares: [ErrorInterceptor],
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
