import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import pool from "../config/db.js";
import { catchAsync } from "../middleware/errorHandler.js";
import { sendVerificationEmail } from "../utils/emailService.js";
import {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  revokeRefreshToken,
  verifyRefreshToken,
  isRefreshTokenValid,
} from "../utils/jwt.js";
import AppError from "../utils/AppError.js";

export const register = catchAsync(async (req, res, next) => {
  const { name, username, email, password } = req.body;

  // Normalize inputs to lowercase
  const normalizedEmail = email.toLowerCase();
  const normalizedUsername = username.toLowerCase();

  const existing = await pool.query(
    "SELECT id FROM users WHERE LOWER(email) = $1 OR LOWER(username) = $2",
    [normalizedEmail, normalizedUsername]
  );
  if (existing.rows.length > 0) {
    throw new AppError("Email or Username already registered", 409);
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Generate 6-digit OTP
  const verificationToken = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const result = await pool.query(
    "INSERT INTO users (name, username, email, password, verification_token, verification_expires) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, username, email, verified, created_at",
    [
      name,
      normalizedUsername,
      normalizedEmail,
      hashedPassword,
      verificationToken,
      verificationExpires,
    ]
  );

  const user = result.rows[0];

  // Send verification email in background to avoid blocking the response
  sendVerificationEmail(email, verificationToken).catch((err) =>
    console.error("Background email send failed:", err)
  );

  res.status(201).json({
    success: true,
    message:
      "Registration successful. Please check your email for the verification code.",
  });
});

export const verifyEmail = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new AppError("Email and OTP are required", 400);
  }

  const result = await pool.query(
    "SELECT id FROM users WHERE LOWER(email) = $1 AND verification_token = $2 AND verification_expires > NOW()",
    [email.toLowerCase(), otp]
  );

  if (result.rows.length === 0) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  const userId = result.rows[0].id;

  await pool.query(
    "UPDATE users SET email_verified = true, verification_token = NULL, verification_expires = NULL WHERE id = $1",
    [userId]
  );

  res.json({
    success: true,
    message: "Email verified successfully",
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Select only necessary fields including password for verification
  const result = await pool.query(
    "SELECT id, name, username, email, password, email_verified, bio, avatar, cover_photo, verified, followers_count, following_count, posts_count FROM users WHERE email = $1",
    [email]
  );

  if (result.rows.length === 0) {
    throw new AppError("Invalid email or password", 401);
  }

  const user = result.rows[0];

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.email_verified) {
    throw new AppError("Please verify your email before logging in", 401);
  }

  // Remove password from user object before generating tokens
  delete user.password;

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await storeRefreshToken(user.id, refreshToken);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  };

  const refreshCookieOptions = {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie("accessToken", accessToken, cookieOptions);
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  res.json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        verified: user.verified,
      },
    },
  });
});

export const refresh = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    throw new AppError("Refresh token is required", 400);
  }

  const isValid = await isRefreshTokenValid(refreshToken);
  if (!isValid) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const decoded = verifyRefreshToken(refreshToken);

  const result = await pool.query(
    "SELECT id, name, username, email FROM users WHERE id = $1",
    [decoded.id]
  );

  if (result.rows.length === 0) {
    throw new AppError("User not found", 401);
  }

  const user = result.rows[0];

  await revokeRefreshToken(refreshToken);

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  await storeRefreshToken(user.id, newRefreshToken);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  };

  const refreshCookieOptions = {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie("accessToken", newAccessToken, cookieOptions);
  res.cookie("refreshToken", newRefreshToken, refreshCookieOptions);

  res.json({
    success: true,
    message: "Token refreshed",
  });
});

export const logout = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

export const getMe = catchAsync(async (req, res, next) => {
  const result = await pool.query(
    "SELECT id, name, username, email, bio, avatar, cover_photo, location, website, verified, followers_count, following_count, posts_count, created_at FROM users WHERE id = $1",
    [req.user.id]
  );

  if (result.rows.length === 0) {
    throw new AppError("User not found", 404);
  }

  res.json({
    success: true,
    data: result.rows[0],
  });
});
