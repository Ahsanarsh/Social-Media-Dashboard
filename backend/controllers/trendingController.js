import pool from "../config/db.js";
import { catchAsync } from "../middleware/errorHandler.js";

// Get Trending Hashtags
export const getTrendingHashtags = catchAsync(async (req, res, next) => {
  const { limit = 10 } = req.query;

  // Simple trending logic: most used standard hashtags
  // In a real app, you might use a time window (e.g., last 24h)
  const result = await pool.query(
    `SELECT * FROM hashtags
     ORDER BY posts_count DESC
     LIMIT $1`,
    [limit]
  );

  res.json({
    success: true,
    data: result.rows,
  });
});

// Get Trending Posts
export const getTrendingPosts = catchAsync(async (req, res, next) => {
  const currentUserId = req.user.id;
  const { limit = 10 } = req.query;

  // Logic: Most liked/commented posts in general
  const result = await pool.query(
    `SELECT p.*, 
     u.name, u.username, u.avatar, u.verified,
     (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = $2) > 0 AS is_liked,
     (SELECT COUNT(*) FROM reposts WHERE post_id = p.id AND user_id = $2) > 0 AS is_reposted,
     (SELECT COUNT(*) FROM bookmarks WHERE post_id = p.id AND user_id = $2) > 0 AS is_bookmarked
     FROM posts p
     JOIN users u ON p.user_id = u.id
     ORDER BY (likes_count + comments_count + reposts_count) DESC, p.created_at DESC
     LIMIT $1`,
    [limit, currentUserId]
  );

  res.json({
    success: true,
    data: result.rows,
  });
});

// Get User Suggestions (Who to follow)
export const getFollowSuggestions = catchAsync(async (req, res, next) => {
  const currentUserId = req.user.id;
  const { limit = 5 } = req.query;

  // Logic: Users not followed by current user, ordered by followers count (popular users)
  // Exclude current user
  const result = await pool.query(
    `SELECT u.id, u.name, u.username, u.avatar, u.verified, u.bio
     FROM users u
     WHERE u.id != $1
     AND u.id NOT IN (SELECT following_id FROM follows WHERE follower_id = $1)
     ORDER BY u.followers_count DESC
     LIMIT $2`,
    [currentUserId, limit]
  );

  res.json({
    success: true,
    data: result.rows,
  });
});
