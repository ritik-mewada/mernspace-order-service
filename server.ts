import app from "./src/app";
import config from "config";
import logger from "./src/config/logger";
import connectDB from "./src/config/db";

const startServer = async () => {
  const PORT = config.get("server.port") || 5504;

  try {
    await connectDB();
    logger.info("Database connected successfully ");
    app
      .listen(PORT, () => logger.info(`Listening on port ${PORT}`))
      .on("error", (err) => {
        console.log("err", err.message);
        process.exit(1);
      });
  } catch (err) {
    logger.error("Error happened: ", err.message);
    process.exit(1);
  }
};

void startServer();
