import express from "express";
import { createPost } from "../controllers/postController.js";
import { autheticatedRequest } from "../middlewares/authMiddleware.js";
import { rateLimitByIP } from "../middlewares/rateLimit.js";

const router = express();

//middleware -> this will tell if the user is an auth user or not
router.use(autheticatedRequest);

router.post("/create-post", rateLimitByIP, createPost);

export default router;
