import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import Redis from "ioredis";
import cors from "cors";
import helmet from "helmet";
import postRoute from "./routes/postRoute.js";
import errorHandler from "./middlewares/errorHandler.js";
import logger from "./utils/logger.js";
import connectDB from "./configs/db.js";

const app = express();
const PORT = process.env.PORT || 3002;

await connectDB();
const redisClient = new Redis(process.env.REDIS_URL);

//middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${req.body}`);
  next();
});

//** Homework implement IP based rate limiting for sensitive endpoints */

//routes -> pass redisClient to routes
app.use(
  "/api/posts",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  postRoute
);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Identity service running on port ${PORT}`);
});
