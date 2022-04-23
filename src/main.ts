import { startServer } from "./server";
import { connect } from "./config/typeorm";

async function main() {
  connect();
  const port: number = Number(process.env.PORT);
  const app = await startServer();
  app.listen(port);

  console.log(`App running on port`, port);
}

main();
