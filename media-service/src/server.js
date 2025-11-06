import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import mediaRoute from "../src/routes/mediaRoute.js";
import errorHandler from "./middlewares/errorHandler.js";
import logger from "./utils/logger.js";
import connectDB from "./config/db.js";

const app = express();

const PORT = process.env.PORT || 3003;

await connectDB();
app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${req.body}`);
  next();
});

app.use("/api/media", mediaRoute);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Identity service running on port ${PORT}`);
});

//unhandled promise rejection
process.on(`unhandledRejection`, (reason, promise) => {
  logger.error("Unhandle Rejection at", promise, "reason", reason);
});
