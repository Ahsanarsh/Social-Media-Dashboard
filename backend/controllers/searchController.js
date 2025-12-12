import pool from "../config/db.js";
import { catchAsync } from "../middleware/errorHandler.js";

// Combined Search (Users and Posts)
export const searchAll = catchAsync(async (req, res, next) => {
  const { q, limit = 10 } = req.query;

  if (!q || q.trim().length < 2) {
    return res.json({
      success: true,
      data: { users: [], posts: [] },
    });
  }

  const searchPattern = `%${q}%`;

  // Search users
  const usersResult = await pool.query(
    `SELECT id, name, username, avatar, verified, bio
     FROM users
     WHERE (name ILIKE $1 OR username ILIKE $1)
     LIMIT $2`,
    [searchPattern, limit]
  );

  // Search posts
  const postsResult = await pool.query(
    `SELECT p.id, p.content, p.created_at,
     u.username, u.name, u.avatar
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.content ILIKE $1
     ORDER BY p.created_at DESC
     LIMIT $2`,
    [searchPattern, limit]
  );

  res.json({
    success: true,
    data: {
      users: usersResult.rows,
      posts: postsResult.rows,
    },
  });
});

// Search Users
export const searchUsers = catchAsync(async (req, res, next) => {
  const { q, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  if (!q) {
    return res.json({ success: true, data: [] });
  }

  const result = await pool.query(
    `SELECT id, name, username, avatar, verified, bio
     FROM users
     WHERE (name ILIKE $1 OR username ILIKE $1)
     LIMIT $2 OFFSET $3`,
    [`%${q}%`, limit, offset]
  );

  res.json({
    success: true,
    data: result.rows,
  });
});

// Search Posts
export const searchPosts = catchAsync(async (req, res, next) => {
  const { q, page = 1, limit = 20 } = req.query;
  const currentUserId = req.user.id;
  const offset = (page - 1) * limit;

  if (!q) {
    return res.json({ success: true, data: [] });
  }

  const result = await pool.query(
    `SELECT p.*, 
     u.name, u.username, u.avatar, u.verified,
     (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = $3) > 0 AS is_liked,
     (SELECT COUNT(*) FROM reposts WHERE post_id = p.id AND user_id = $3) > 0 AS is_reposted,
     (SELECT COUNT(*) FROM bookmarks WHERE post_id = p.id AND user_id = $3) > 0 AS is_bookmarked
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.content ILIKE $1
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $4`,
    [`%${q}%`, limit, currentUserId, offset]
  );

  res.json({
    success: true,
    data: result.rows,
  });
});

// Search Hashtags
export const searchHashtags = catchAsync(async (req, res, next) => {
  const { q, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  if (!q) {
    return res.json({ success: true, data: [] });
  }

  const result = await pool.query(
    `SELECT * FROM hashtags
     WHERE tag ILIKE $1
     ORDER BY posts_count DESC
     LIMIT $2 OFFSET $3`,
    [`%${q}%`, limit, offset]
  );

  res.json({
    success: true,
    data: result.rows,
  });
});
