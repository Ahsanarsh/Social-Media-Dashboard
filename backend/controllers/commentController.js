import pool from "../config/db.js";
import { getIO } from "../utils/socket.js";
import { catchAsync } from "../middleware/errorHandler.js";
import AppError from "../utils/AppError.js";

// Get Post Comments
export const getPostComments = catchAsync(async (req, res, next) => {
  const { id: postId } = req.params;
  const userId = req.user.id;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  // This query fetches top-level comments (where parent_comment_id is NULL)
  // You might want to adjust logic if you want all comments or nested structure
  // For simplicity, let's fetch all comments for the post flattened or just top level
  // Usually, a simple fetch includes parent_comment_id to reconstruct tree on frontend

  const result = await pool.query(
    `SELECT c.*, 
     u.name, u.username, u.avatar, u.verified,
     (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id AND user_id = $2) > 0 AS is_liked
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.post_id = $1
     ORDER BY c.created_at ASC
     LIMIT $3 OFFSET $4`,
    [postId, userId, limit, offset]
  );

  res.json({
    success: true,
    results: result.rows.length,
    data: result.rows,
  });
});

// Add Comment
export const addComment = catchAsync(async (req, res, next) => {
  const { id: postId } = req.params;
  const { content, parent_comment_id } = req.body;
  const userId = req.user.id;

  if (!content) {
    throw new AppError("Comment content is required", 400);
  }

  // Check if post exists
  const postCheck = await pool.query("SELECT id FROM posts WHERE id = $1", [
    postId,
  ]);
  if (postCheck.rows.length === 0) {
    throw new AppError("Post not found", 404);
  }

  const result = await pool.query(
    `INSERT INTO comments (user_id, post_id, parent_comment_id, content) 
     VALUES ($1, $2, $3, $4) 
     RETURNING *, 
     (SELECT row_to_json(user_data) FROM (SELECT id, name, username, avatar FROM users WHERE id = $1) user_data) AS user`,
    [userId, postId, parent_comment_id || null, content]
  );

  // Increment comments count on post
  await pool.query(
    "UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1",
    [postId]
  );

  res.status(201).json({
    success: true,
    data: result.rows[0],
  });

  // Notify Post Author
  const postData = await pool.query("SELECT user_id FROM posts WHERE id = $1", [
    postId,
  ]);
  const postAuthorId = postData.rows[0].user_id;

  if (postAuthorId !== userId) {
    await pool.query(
      "INSERT INTO notifications (user_id, actor_id, type, post_id, comment_id, content) VALUES ($1, $2, 'comment', $3, $4, 'commented on your post')",
      [postAuthorId, userId, postId, result.rows[0].id]
    );

    try {
      getIO().to(postAuthorId.toString()).emit("notification", {
        type: "comment",
        message: "New comment on your post",
        postId: postId,
        actorId: userId,
      });
    } catch (err) {
      console.error("Socket emit failed", err);
    }
  }

  // Notify Parent Comment Author (if reply)
  if (parent_comment_id) {
    const parentComment = await pool.query(
      "SELECT user_id FROM comments WHERE id = $1",
      [parent_comment_id]
    );
    if (parentComment.rows.length > 0) {
      const parentAuthorId = parentComment.rows[0].user_id;
      if (parentAuthorId !== userId && parentAuthorId !== postAuthorId) {
        // Avoid double notification if parent author is also post author
        await pool.query(
          "INSERT INTO notifications (user_id, actor_id, type, post_id, comment_id, content) VALUES ($1, $2, 'comment', $3, $4, 'replied to your comment')",
          [parentAuthorId, userId, postId, result.rows[0].id]
        );

        try {
          getIO().to(parentAuthorId.toString()).emit("notification", {
            type: "comment",
            message: "Reply to your comment",
            postId: postId,
            actorId: userId,
          });
        } catch (err) {
          console.error("Socket emit failed", err);
        }
      }
    }
  }
});

// Update Comment
export const updateComment = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  if (!content) {
    throw new AppError("Content is required", 400);
  }

  const result = await pool.query(
    "UPDATE comments SET content = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
    [content, id, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError("Comment not found or you are not authorized", 404);
  }

  res.json({
    success: true,
    data: result.rows[0],
  });
});

// Delete Comment
export const deleteComment = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Get post_id before deleting to update count
  const commentCheck = await pool.query(
    "SELECT post_id FROM comments WHERE id = $1 AND user_id = $2",
    [id, userId]
  );

  if (commentCheck.rows.length === 0) {
    throw new AppError("Comment not found or you are not authorized", 404);
  }

  const postId = commentCheck.rows[0].post_id;

  await pool.query("DELETE FROM comments WHERE id = $1", [id]);

  // Decrement comments count
  await pool.query(
    "UPDATE posts SET comments_count = comments_count - 1 WHERE id = $1",
    [postId]
  );

  res.json({
    success: true,
    message: "Comment deleted successfully",
  });
});

// Like Comment
export const likeComment = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    await pool.query(
      "INSERT INTO comment_likes (user_id, comment_id) VALUES ($1, $2)",
      [userId, id]
    );

    await pool.query(
      "UPDATE comments SET likes_count = likes_count + 1 WHERE id = $1",
      [id]
    );

    res.json({
      success: true,
      message: "Comment liked",
    });
  } catch (error) {
    if (error.code === "23505") {
      // Toggle like (unlike)? The instruction says POST for like...
      // usually specific endpoint for unlike is preferred or toggle logic.
      // Instruction didn't specify DELETE /api/comments/:id/like, but it did for posts.
      // Wait, instruction DO NOT specify DELETE /api/comments/:id/like.
      // "POST /api/comments/:id/like".
      // I'll assume standard toggle or just error.
      // Given the pattern in Post, user might expect Unlike too.
      // But I will stick to "Already liked" for now to match Post logic unless asked.
      return res
        .status(400)
        .json({ success: false, message: "Comment already liked" });
    }
    throw error;
  }
});

// Unlike Comment (Optional, but good UX)
export const unlikeComment = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const result = await pool.query(
    "DELETE FROM comment_likes WHERE user_id = $1 AND comment_id = $2 RETURNING *",
    [userId, id]
  );

  if (result.rows.length === 0) {
    throw new AppError("Comment not liked yet", 400);
  }

  await pool.query(
    "UPDATE comments SET likes_count = likes_count - 1 WHERE id = $1",
    [id]
  );

  res.json({
    success: true,
    message: "Comment unliked",
  });
});

// Get User's Comments (Replies)
export const getUserComments = catchAsync(async (req, res, next) => {
  const { id: userId } = req.params;
  const currentUserId = req.user.id;

  const result = await pool.query(
    `SELECT c.*, 
     p.content as post_content,
     p.user_id as post_author_id,
     u.name, u.username, u.avatar, u.verified,
     (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id AND user_id = $2) > 0 AS is_liked
     FROM comments c
     JOIN users u ON c.user_id = u.id
     JOIN posts p ON c.post_id = p.id
     WHERE c.user_id = $1
     ORDER BY c.created_at DESC`,
    [userId, currentUserId]
  );

  res.json({
    success: true,
    results: result.rows.length,
    data: result.rows,
  });
});
