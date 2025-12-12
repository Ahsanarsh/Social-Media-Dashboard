import rateLimit from "express-rate-limit";
import { RATE_LIMIT_CONFIG } from "../utils/constants.js";

// Rate limiter for authentication routes (stricter)
export const authLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.AUTH.windowMs,
  max: RATE_LIMIT_CONFIG.AUTH.max,
  message: RATE_LIMIT_CONFIG.AUTH.message,
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: RATE_LIMIT_CONFIG.AUTH.message,
    });
  },
});

// Rate limiter for general API routes (more lenient)
export const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.API.windowMs,
  max: RATE_LIMIT_CONFIG.API.max,
  message: RATE_LIMIT_CONFIG.API.message,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: RATE_LIMIT_CONFIG.API.message,
    });
  },
});
