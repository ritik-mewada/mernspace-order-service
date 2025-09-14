import mongoose from "mongoose";
import config from "config";
import logger from "./logger";

const connectDB = async () => {
  return await mongoose.connect(config.get("database.url"));
};

export default connectDB;
