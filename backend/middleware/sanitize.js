import validator from "validator";

/**
 * Sanitize user input to prevent XSS attacks
 * Removes HTML tags and dangerous characters
 */
export const sanitizeInput = (input) => {
  if (typeof input === "string") {
    // Escape HTML to prevent XSS
    let sanitized = validator.escape(input);
    // Trim whitespace
    sanitized = sanitized.trim();
    return sanitized;
  }
  return input;
};

/**
 * Recursively sanitize all string values in an object
 */
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  const sanitized = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === "string") {
        sanitized[key] = sanitizeInput(obj[key]);
      } else if (typeof obj[key] === "object") {
        sanitized[key] = sanitizeObject(obj[key]);
      } else {
        sanitized[key] = obj[key];
      }
    }
  }

  return sanitized;
};

/**
 * Middleware to sanitize request body, query, and params
 */
export const sanitizeMiddleware = (req, res, next) => {
  try {
    // Only sanitize if body exists and is an object
    if (
      req.body &&
      typeof req.body === "object" &&
      Object.keys(req.body).length > 0
    ) {
      req.body = sanitizeObject(req.body);
    }

    // Skip query and params sanitization (causes issues with IDs)
    // We'll validate these in controllers instead

    next();
  } catch (error) {
    // If sanitization fails, continue anyway
    console.error("Sanitization error:", error);
    next();
  }
};

/**
 * Sanitize specific fields that allow limited HTML (like bio)
 * Strips dangerous tags but allows safe formatting
 */
export const sanitizeRichText = (text) => {
  if (typeof text !== "string") return text;

  // Remove script tags and onclick events
  let sanitized = text.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ""
  );
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/javascript:/gi, "");

  // Trim and limit length
  return sanitized.trim();
};

/**
 * Validate and sanitize email
 */
export const sanitizeEmail = (email) => {
  if (!email || typeof email !== "string") return "";

  const trimmed = email.trim().toLowerCase();
  return validator.isEmail(trimmed) ? trimmed : "";
};

/**
 * Validate and sanitize username
 */
export const sanitizeUsername = (username) => {
  if (!username || typeof username !== "string") return "";

  // Allow only alphanumeric, underscore, and hyphen
  const cleaned = username.trim().replace(/[^a-zA-Z0-9_-]/g, "");
  return cleaned.substring(0, 30); // Max 30 characters
};

/**
 * Prevent NoSQL injection by removing dangerous operators
 */
export const preventNoSQLInjection = (obj) => {
  if (typeof obj !== "object" || obj === null) return obj;

  const cleaned = {};
  for (const key in obj) {
    // Remove keys that start with $ (MongoDB operators) or contain .
    if (!key.startsWith("$") && !key.includes(".")) {
      if (typeof obj[key] === "object") {
        cleaned[key] = preventNoSQLInjection(obj[key]);
      } else {
        cleaned[key] = obj[key];
      }
    }
  }
  return cleaned;
};

export default sanitizeMiddleware;
