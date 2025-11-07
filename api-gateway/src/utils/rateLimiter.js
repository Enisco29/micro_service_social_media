import logger from "./logger.js";
import Redis from "ioredis";
import { RedisStore } from "rate-limit-redis";
import { rateLimit } from "express-rate-limit";

const redisClient = new Redis(process.env.REDIS_URL);

//rate limiting
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
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

export default rateLimiter;
