import { getIO } from "../utils/socket.js";
import pool from "../config/db.js";
import { catchAsync } from "../middleware/errorHandler.js";
import AppError from "../utils/AppError.js";

import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

// Create Post
export const createPost = catchAsync(async (req, res, next) => {
  const { content } = req.body;
  const userId = req.user.id;
  let image_url = req.body.image_url;

  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer);
    image_url = result.secure_url;
  }

  if (!content && !image_url) {
    throw new AppError("Post content or image is required", 400);
  }

  const result = await pool.query(
    `INSERT INTO posts (user_id, content, image_url) 
     VALUES ($1, $2, $3) 
     RETURNING *`,
    [userId, content || "", image_url]
  );

  const post = result.rows[0];

  // Get user data
  const userData = await pool.query(
    "SELECT id, name, username, avatar FROM users WHERE id = $1",
    [userId]
  );

  // Format response with all necessary fields
  const responsePost = {
    ...post,
    name: userData.rows[0].name,
    username: userData.rows[0].username,
    avatar: userData.rows[0].avatar,
    likes_count: 0,
    comments_count: 0,
    reposts_count: 0,
    is_liked: false,
    is_reposted: false,
    is_bookmarked: false,
  };

  // Parse and process hashtags and mentions
  await processPostTagsAndMentions(post.id, content, userId);

  // Update posts count for user
  await pool.query(
    "UPDATE users SET posts_count = posts_count + 1 WHERE id = $1",
    [userId]
  );

  res.status(201).json({
    success: true,
    data: responsePost,
  });
});

// Update Post
export const updatePost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  if (!content) {
    throw new AppError("Content cannot be empty for update", 400);
  }

  // Check ownership
  const check = await pool.query(
    "SELECT id FROM posts WHERE id = $1 AND user_id = $2",
    [id, userId]
  );

  if (check.rows.length === 0) {
    throw new AppError("Post not found or authorized", 404);
  }

  const result = await pool.query(
    "UPDATE posts SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
    [content, id]
  );

  // Re-process tags/mentions?
  // Ideally, we should clear old tags/mentions and re-add.
  // For simplicity MVP, we might append or ignore clearing.
  // Let's try to clear validly:
  await pool.query("DELETE FROM post_hashtags WHERE post_id = $1", [id]);
  await pool.query("DELETE FROM mentions WHERE post_id = $1", [id]);

  await processPostTagsAndMentions(id, content, userId);

  res.json({
    success: true,
    data: result.rows[0],
  });
});

// Get Feed (Posts from followed users)
export const getFeed = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT p.*, 
     u.name, u.username, u.avatar, u.verified,
     (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = $1) > 0 AS is_liked,
     (SELECT COUNT(*) FROM reposts WHERE post_id = p.id AND user_id = $1) > 0 AS is_reposted,
     (SELECT COUNT(*) FROM bookmarks WHERE post_id = p.id AND user_id = $1) > 0 AS is_bookmarked
     FROM posts p
     JOIN users u ON p.user_id = u.id
     JOIN follows f ON p.user_id = f.following_id
     WHERE f.follower_id = $1
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  res.json({
    success: true,
    results: result.rows.length,
    data: result.rows,
  });
});

// Get Explore (All recent posts)
export const getExplore = catchAsync(async (req, res, next) => {
  const currentUserId = req.user.id;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT p.*, 
     u.name, u.username, u.avatar, u.verified,
     (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = $1) > 0 AS is_liked,
     (SELECT COUNT(*) FROM reposts WHERE post_id = p.id AND user_id = $1) > 0 AS is_reposted,
     (SELECT COUNT(*) FROM bookmarks WHERE post_id = p.id AND user_id = $1) > 0 AS is_bookmarked
     FROM posts p
     JOIN users u ON p.user_id = u.id
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [currentUserId, limit, offset]
  );

  res.json({
    success: true,
    results: result.rows.length,
    data: result.rows,
  });
});

// Get Single Post
export const getPost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const currentUserId = req.user.id;

  const result = await pool.query(
    `SELECT p.*, 
     u.name, u.username, u.avatar, u.verified,
     (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = $2) > 0 AS is_liked,
     (SELECT COUNT(*) FROM reposts WHERE post_id = p.id AND user_id = $2) > 0 AS is_reposted,
     (SELECT COUNT(*) FROM bookmarks WHERE post_id = p.id AND user_id = $2) > 0 AS is_bookmarked
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.id = $1`,
    [id, currentUserId]
  );

  if (result.rows.length === 0) {
    throw new AppError("Post not found", 404);
  }

  res.json({
    success: true,
    data: result.rows[0],
  });
});

// Delete Post
export const deletePost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const result = await pool.query(
    "DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING *",
    [id, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError("Post not found or you are not authorized", 404);
  }

  // Update posts count
  await pool.query(
    "UPDATE users SET posts_count = posts_count - 1 WHERE id = $1",
    [userId]
  );

  res.json({
    success: true,
    message: "Post deleted successfully",
  });
});

// Like Post
export const likePost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    await pool.query("INSERT INTO likes (user_id, post_id) VALUES ($1, $2)", [
      userId,
      id,
    ]);

    // ...

    // Increment likes count
    await pool.query(
      "UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1",
      [id]
    );

    // Get Post Owner URL to notify
    const postData = await pool.query(
      "SELECT user_id FROM posts WHERE id = $1",
      [id]
    );
    const hostId = postData.rows[0].user_id;

    if (hostId !== userId) {
      // Create Notification in DB (omitted for brevity, but should happen)

      // Emit Socket Event
      try {
        getIO().to(hostId.toString()).emit("notification", {
          type: "like",
          message: "Someone liked your post",
          postId: id,
          actorId: userId,
        });
      } catch (err) {
        console.error("Socket emit failed", err);
      }
    }

    res.json({
      success: true,
      message: "Post liked",
    });
  } catch (error) {
    if (error.code === "23505") {
      // Unique violation
      return res
        .status(400)
        .json({ success: false, message: "Post already liked" });
    }
    throw error;
  }
});

// Unlike Post
export const unlikePost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const result = await pool.query(
    "DELETE FROM likes WHERE user_id = $1 AND post_id = $2 RETURNING *",
    [userId, id]
  );

  if (result.rows.length === 0) {
    throw new AppError("Post not liked yet", 400);
  }

  // Decrement likes count
  await pool.query(
    "UPDATE posts SET likes_count = likes_count - 1 WHERE id = $1",
    [id]
  );

  res.json({
    success: true,
    message: "Post unliked",
  });
});

// Repost
export const repostPost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { quote_text } = req.body; // Optional quote text
  const userId = req.user.id;

  try {
    await pool.query(
      "INSERT INTO reposts (user_id, post_id, quote_text) VALUES ($1, $2, $3)",
      [userId, id, quote_text || null]
    );

    await pool.query(
      "UPDATE posts SET reposts_count = reposts_count + 1 WHERE id = $1",
      [id]
    );

    // Notify Author
    const postData = await pool.query(
      "SELECT user_id FROM posts WHERE id = $1",
      [id]
    );
    const hostId = postData.rows[0].user_id;

    if (hostId !== userId) {
      const notifContent = quote_text
        ? `quoted your post: "${quote_text.substring(0, 50)}${
            quote_text.length > 50 ? "..." : ""
          }"`
        : "reposted your post";

      await pool.query(
        "INSERT INTO notifications (user_id, actor_id, type, post_id, content) VALUES ($1, $2, 'repost', $3, $4)",
        [hostId, userId, id, notifContent]
      );

      try {
        const io = getIO();
        if (io) {
          io.to(hostId.toString()).emit("notification", {
            type: "repost",
            message: quote_text
              ? "Someone quoted your post"
              : "Someone reposted your post",
            postId: id,
            actorId: userId,
          });
        }
      } catch (err) {
        console.error("Socket emit failed (non-critical):", err.message);
      }
    }

    res.json({
      success: true,
      message: quote_text ? "Post quoted" : "Post reposted",
    });
  } catch (error) {
    if (error.code === "23505") {
      throw new AppError("Already reposted", 400);
    }
    throw error;
  }
});

// Helper: Process Hashtags and Mentions
const processPostTagsAndMentions = async (postId, content, actorId) => {
  if (!content) return;

  // 1. Hashtags
  const hashtags = content.match(/#[\w]+/g);
  if (hashtags) {
    // Unique tags
    const uniqueTags = [...new Set(hashtags.map((tag) => tag.toLowerCase()))];

    for (const tag of uniqueTags) {
      // Upsert hashtag
      let tagRes = await pool.query("SELECT id FROM hashtags WHERE tag = $1", [
        tag,
      ]);

      if (tagRes.rows.length === 0) {
        tagRes = await pool.query(
          "INSERT INTO hashtags (tag, posts_count) VALUES ($1, 1) RETURNING id",
          [tag]
        );
      } else {
        await pool.query(
          "UPDATE hashtags SET posts_count = posts_count + 1 WHERE id = $1",
          [tagRes.rows[0].id]
        );
      }

      const hashtagId = tagRes.rows[0].id;

      // Link post to hashtag
      await pool.query(
        "INSERT INTO post_hashtags (post_id, hashtag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [postId, hashtagId]
      );
    }
  }

  // 2. Mentions
  const mentions = content.match(/@[\w]+/g);
  if (mentions) {
    const uniqueMentions = [...new Set(mentions.map((m) => m.slice(1)))]; // remove @

    for (const username of uniqueMentions) {
      const userRes = await pool.query(
        "SELECT id FROM users WHERE username = $1",
        [username]
      );

      if (userRes.rows.length > 0) {
        const mentionedUserId = userRes.rows[0].id;

        // Insert mention record
        await pool.query(
          "INSERT INTO mentions (post_id, mentioned_user_id) VALUES ($1, $2)",
          [postId, mentionedUserId]
        );

        // Notify mentioned user
        if (mentionedUserId !== actorId) {
          await pool.query(
            "INSERT INTO notifications (user_id, actor_id, type, post_id, content) VALUES ($1, $2, 'mention', $3, 'mentioned you in a post')",
            [mentionedUserId, actorId, postId]
          );

          try {
            getIO().to(mentionedUserId.toString()).emit("notification", {
              type: "mention",
              message: "You were mentioned in a post",
              postId: postId,
              actorId: actorId,
            });
          } catch (err) {
            console.error("Socket emit failed", err);
          }
        }
      }
    }
  }
};

// Bookmark Post
export const bookmarkPost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    await pool.query(
      "INSERT INTO bookmarks (user_id, post_id) VALUES ($1, $2)",
      [userId, id]
    );

    // Notify post author
    const postData = await pool.query(
      "SELECT user_id FROM posts WHERE id = $1",
      [id]
    );
    const postAuthorId = postData.rows[0]?.user_id;

    if (postAuthorId && postAuthorId !== userId) {
      await pool.query(
        "INSERT INTO notifications (user_id, actor_id, type, post_id, content) VALUES ($1, $2, 'bookmark', $3, 'bookmarked your post')",
        [postAuthorId, userId, id]
      );

      // Try to send real-time notification (non-critical)
      try {
        const io = getIO();
        if (io) {
          io.to(postAuthorId.toString()).emit("notification", {
            type: "bookmark",
            message: "Someone bookmarked your post",
            postId: id,
            actorId: userId,
          });
        }
      } catch (err) {
        console.error("Socket emit failed (non-critical):", err.message);
      }
    }

    res.json({
      success: true,
      message: "Post bookmarked",
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.json({ success: true, message: "Post already bookmarked" });
    }
    throw error;
  }
});

// Unbookmark Post
export const unbookmarkPost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const result = await pool.query(
    "DELETE FROM bookmarks WHERE user_id = $1 AND post_id = $2 RETURNING *",
    [userId, id]
  );

  if (result.rows.length === 0) {
    throw new AppError("Post not bookmarked yet", 400);
  }

  res.json({
    success: true,
    message: "Post unbookmarked",
  });
});
