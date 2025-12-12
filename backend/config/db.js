import pkg from "pg";
import dotenv from "dotenv";
import { DB_POOL_CONFIG } from "../utils/constants.js";

const { Pool } = pkg;

dotenv.config();

// Support both connection string (Neon) and individual params (local)
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false, // Required for Neon
        },
        ...DB_POOL_CONFIG, // Add optimized pool settings
      }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        ...DB_POOL_CONFIG, // Add optimized pool settings for local too
      }
);

pool.on("connect", () => {
  console.log("Database connected");
});

pool.on("error", (err) => {
  console.error("Database connection error:", err);
  process.exit(1);
});

export default pool;
