import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import sanitizeMiddleware from "./middleware/sanitize.js";
import authRoutes from "./routes/AuthenticationRoutes/auth.js";
import postRoutes from "./routes/PostRoutes/posts.js";
import commentRoutes from "./routes/CommentsRoutes/comment.js";
import userRoutes from "./routes/UserRoutes/users.js";
import searchRoutes from "./routes/SearchRoutes/search.js";
import notificationRoutes from "./routes/NotificationRoutes/notifications.js";
import trendingRoutes from "./routes/TrendingRoutes/trending.js";
import { globalErrorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

// CORS MUST be first (before other middleware)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Security Middleware (after CORS)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Disable for API server
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Input sanitization (XSS prevention)
app.use(sanitizeMiddleware);

// Logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/trending", trendingRoutes);

// Global Error Handler
app.use(globalErrorHandler);

import { initSocket } from "./utils/socket.js";

// ... previous code

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize Socket.io
initSocket(server);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
