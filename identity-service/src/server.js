import connectDB from "./configs/db.js";
import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import logger from "./utils/logger.js";
import { RateLimiterRedis } from "rate-limiter-flexible";
import Redis from "ioredis";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import userRouter from "../src/routes/identity-service.js";
import errorHandler from "../src/middlewares/errorHandler.js";

const PORT = process.env.PORT;
const app = express();

//connect to mongodb
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

//DDos protection and rate limiting
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 10,
  duration: 1,
});

app.use((req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then(() => next())
    .catch(() => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip} `);
      res.status(429).json({
        success: false,
        message: "Too many requests",
      });
    });
});

//IP based rate limiting for sensitive endpoints
const sensitiveEndpointsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Sentitive endpoint rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: "Too many requests",
    });
  },
  store: new RedisStore({
    sendCommand: (...arges) => redisClient.call(...arges),
  }),
});

//apply this sensitiveEndpointsLimiter to our routes
app.use("/api/auth/register", sensitiveEndpointsLimiter);

//routes
app.use("/api/auth", userRouter);

//error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Identity service running on port ${PORT}`);
});

//unhandled promise rejection
process.on(`unhandledRejection`, (reason, promise) => {
  logger.error("Unhandle Rejection at", promise, "reason", reason);
});
