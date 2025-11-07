import logger from "./logger.js";

const proxyOptions = {
  proxyReqPathResolver: (req) => {
    // replace /v1 with /api for internal routing
    return req.originalUrl.replace(/^\/v1/, "/api");
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`Proxy error: ${err.message}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  },
};

export default proxyOptions;
