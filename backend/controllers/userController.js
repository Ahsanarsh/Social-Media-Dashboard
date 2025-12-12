import pool from "../config/db.js";
import { getIO } from "../utils/socket.js";
import { catchAsync } from "../middleware/errorHandler.js";
import AppError from "../utils/AppError.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

// Get User Profile
export const getUserProfile = catchAsync(async (req, res, next) => {
  const { username } = req.params;
  const currentUserId = req.user.id;

  const result = await pool.query(
    `SELECT u.id, u.name, u.username, u.bio, u.location, u.website, u.avatar, u.cover_photo, u.verified,
     u.followers_count, u.following_count, u.posts_count, u.created_at,
     (SELECT COUNT(*) FROM follows WHERE follower_id = $2 AND following_id = u.id) > 0 AS is_following
     FROM users u
     WHERE u.username = $1`,
    [username, currentUserId]
  );

  if (result.rows.length === 0) {
    throw new AppError("User not found", 404);
  }

  res.json({
    success: true,
    data: result.rows[0],
  });
});

// Get User Posts
export const getUserPosts = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const currentUserId = req.user.id;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT p.*, 
     u.name, u.username, u.avatar, u.verified,
     (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = $2) > 0 AS is_liked,
     (SELECT COUNT(*) FROM reposts WHERE post_id = p.id AND user_id = $2) > 0 AS is_reposted,
     (SELECT COUNT(*) FROM bookmarks WHERE post_id = p.id AND user_id = $2) > 0 AS is_bookmarked
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.user_id = $1
     ORDER BY p.created_at DESC
     LIMIT $3 OFFSET $4`,
    [id, currentUserId, limit, offset]
  );

  res.json({
    success: true,
    results: result.rows.length,
    data: result.rows,
  });
});

// Get User Liked Posts
export const getUserLikedPosts = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const currentUserId = req.user.id;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT p.*, 
     u.name, u.username, u.avatar, u.verified,
     (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = $2) > 0 AS is_liked,
     (SELECT COUNT(*) FROM reposts WHERE post_id = p.id AND user_id = $2) > 0 AS is_reposted,
     (SELECT COUNT(*) FROM bookmarks WHERE post_id = p.id AND user_id = $2) > 0 AS is_bookmarked
     FROM posts p
     JOIN users u ON p.user_id = u.id
     JOIN likes l ON l.post_id = p.id
     WHERE l.user_id = $1
     ORDER BY l.created_at DESC
     LIMIT $3 OFFSET $4`,
    [id, currentUserId, limit, offset]
  );

  res.json({
    success: true,
    results: result.rows.length,
    data: result.rows,
  });
});

// Get User Bookmarked Posts
export const getUserBookmarkedPosts = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const currentUserId = req.user.id;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT p.*, 
     u.name, u.username, u.avatar, u.verified,
     (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = $2) > 0 AS is_liked,
     (SELECT COUNT(*) FROM reposts WHERE post_id = p.id AND user_id = $2) > 0 AS is_reposted,
     (SELECT COUNT(*) FROM bookmarks WHERE post_id = p.id AND user_id = $2) > 0 AS is_bookmarked
     FROM posts p
     JOIN users u ON p.user_id = u.id
     JOIN bookmarks b ON b.post_id = p.id
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC
     LIMIT $3 OFFSET $4`,
    [id, currentUserId, limit, offset]
  );

  res.json({
    success: true,
    results: result.rows.length,
    data: result.rows,
  });
});

// Get Followers
export const getFollowers = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const currentUserId = req.user.id;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT u.id, u.name, u.username, u.avatar, u.verified, u.bio,
     (SELECT COUNT(*) FROM follows WHERE follower_id = $2 AND following_id = u.id) > 0 AS is_following
     FROM follows f
     JOIN users u ON f.follower_id = u.id
     WHERE f.following_id = $1
     LIMIT $3 OFFSET $4`,
    [id, currentUserId, limit, offset]
  );

  res.json({
    success: true,
    data: result.rows,
  });
});

// Get Following
export const getFollowing = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const currentUserId = req.user.id;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT u.id, u.name, u.username, u.avatar, u.verified, u.bio,
     (SELECT COUNT(*) FROM follows WHERE follower_id = $2 AND following_id = u.id) > 0 AS is_following
     FROM follows f
     JOIN users u ON f.following_id = u.id
     WHERE f.follower_id = $1
     LIMIT $3 OFFSET $4`,
    [id, currentUserId, limit, offset]
  );

  res.json({
    success: true,
    data: result.rows,
  });
});

// Update Profile
export const updateProfile = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { name, bio, location, website } = req.body;
  let { avatar, cover_photo } = req.body;

  // Handle file uploads if sent via form-data with fields 'avatar' or 'cover_photo'
  // Note: multer processes files into req.files
  if (req.files) {
    if (req.files.avatar) {
      const result = await uploadToCloudinary(req.files.avatar[0].buffer);
      avatar = result.secure_url;
    }
    if (req.files.cover_photo) {
      const result = await uploadToCloudinary(req.files.cover_photo[0].buffer);
      cover_photo = result.secure_url;
    }
  }

  // Build dynamic update query
  const updates = [];
  const values = [];
  let paramIndex = 1;

  if (name) {
    updates.push(`name = $${paramIndex++}`);
    values.push(name);
  }
  if (bio) {
    updates.push(`bio = $${paramIndex++}`);
    values.push(bio);
  }
  if (location) {
    updates.push(`location = $${paramIndex++}`);
    values.push(location);
  }
  if (website) {
    updates.push(`website = $${paramIndex++}`);
    values.push(website);
  }
  if (avatar) {
    updates.push(`avatar = $${paramIndex++}`);
    values.push(avatar);
  }
  if (cover_photo) {
    updates.push(`cover_photo = $${paramIndex++}`);
    values.push(cover_photo);
  }

  if (updates.length === 0) {
    throw new AppError("No fields to update", 400);
  }

  values.push(userId);
  const query = `UPDATE users SET ${updates.join(
    ", "
  )} WHERE id = $${paramIndex} RETURNING id, name, username, bio, location, website, avatar, cover_photo`;

  const result = await pool.query(query, values);

  res.json({
    success: true,
    data: result.rows[0],
  });
});

// Follow User
export const followUser = catchAsync(async (req, res, next) => {
  const { id: followingId } = req.params;
  const followerId = req.user.id;

  if (parseInt(followingId) === followerId) {
    throw new AppError("You cannot follow yourself", 400);
  }

  try {
    await pool.query(
      "INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)",
      [followerId, followingId]
    );

    // Update counts
    await pool.query(
      "UPDATE users SET following_count = following_count + 1 WHERE id = $1",
      [followerId]
    );
    await pool.query(
      "UPDATE users SET followers_count = followers_count + 1 WHERE id = $1",
      [followingId]
    );

    // Notification
    await pool.query(
      "INSERT INTO notifications (user_id, actor_id, type, content) VALUES ($1, $2, 'follow', 'started following you')",
      [followingId, followerId]
    );

    try {
      getIO().to(followingId.toString()).emit("notification", {
        type: "follow",
        message: "New follower",
        actorId: followerId,
      });
    } catch (err) {
      console.error("Socket emit failed", err);
    }

    res.json({
      success: true,
      message: "User followed successfully",
    });
  } catch (error) {
    if (error.code === "23505") {
      return res
        .status(400)
        .json({ success: false, message: "Already following" });
    }
    throw error;
  }
});

// Unfollow User
export const unfollowUser = catchAsync(async (req, res, next) => {
  const { id: followingId } = req.params;
  const followerId = req.user.id;

  const result = await pool.query(
    "DELETE FROM follows WHERE follower_id = $1 AND following_id = $2 RETURNING *",
    [followerId, followingId]
  );

  if (result.rows.length === 0) {
    throw new AppError("You are not following this user", 400);
  }

  // Update counts
  await pool.query(
    "UPDATE users SET following_count = following_count - 1 WHERE id = $1",
    [followerId]
  );
  await pool.query(
    "UPDATE users SET followers_count = followers_count - 1 WHERE id = $1",
    [followingId]
  );

  res.json({
    success: true,
    message: "User unfollowed successfully",
  });
});
