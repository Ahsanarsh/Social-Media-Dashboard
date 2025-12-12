import express from "express";
import joi from "joi";
import { authenticate } from "../../middleware/auth.js";
import validateUser from "../../middleware/validation.js";
import { authLimiter } from "../../middleware/rateLimiter.js";
import AppError from "../../utils/AppError.js";
import {
  register,
  login,
  verifyEmail,
  refresh,
  logout,
  getMe,
} from "../../controllers/authController.js";

const router = express.Router();

// Login Validation Schema
const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
});

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));
  next();
};

// Routes with rate limiting on sensitive endpoints
router.post("/register", authLimiter, validateUser, register);
router.post("/verify-email", authLimiter, verifyEmail);
router.post("/login", authLimiter, validateLogin, login);
router.post("/refresh", refresh);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getMe);

export default router;
