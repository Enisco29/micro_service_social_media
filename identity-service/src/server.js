import connectDB from "./configs/db.js";
import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import logger from "./utils/logger.js";
import { RateLimiterRedis } from "rate-limiter-flexible";
import Redis from "ioredis";

const app = express();

//connect to mongodb
connectDB();
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

//DDos protection and rate limiting
const rateLimiting = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 10,
  duration: 1,
});

app.use((req, res, next) => {
  reteLimiter.consume;
});
