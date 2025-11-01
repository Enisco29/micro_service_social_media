import mongoose from "mongoose";
import logger from "../utils/logger.js";

//connect to db
const connectDB = () => {
  mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => logger.info("Connected to mongodb"))
    .catch((e) => logger.error("MongoDB connection error", e));
};

export default connectDB;
