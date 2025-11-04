import { RateLimiterRedis } from "rate-limiter-flexible";
import Redis from "ioredis";
import logger from "../utils/logger.js";

const redisClient = new Redis(process.env.REDIS_URL);

export const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "ip_limit",
  points: 5, // 5 requests
  duration: 60, // per 60 seconds
});

export const rateLimitByIP = async (req, res, next) => {
  try {
    const ip = req.ip;
    await rateLimiter.consume(ip);
    next();
  } catch (error) {
    // rate limit exceeded
    logger.warn(`Rate limit exceeded for IP: ${req.ip} `);
    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  }
};
