import express from "express";
import multer from "multer";
import uploadMedia from "../controllers/mediaController.js";
import { autheticatedRequest } from "../middlewares/authMiddleware.js";
import logger from "../utils/logger.js";
import { rateLimitByIP } from "../middlewares/rateLimit.js";

const router = express.Router();

//configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single("file");

router.post(
  "/upload",
  autheticatedRequest,
  (req, res, next) => {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        logger.error("multer error while uploading:", err);
        return res.status(400).json({
          message: "multer error while uploading",
          error: err.message,
          stack: err.stack,
        });
      } else if (err) {
        logger.error("Unknow error occured while uploading:", err);
        return res.status(400).json({
          message: "Unknow error occured while uploading",
          error: err.message,
          stack: err.stack,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "No file found",
        });
      }

      next();
    });
  },
  rateLimitByIP,
  uploadMedia
);

export default router;
