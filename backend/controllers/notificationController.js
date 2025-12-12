import pool from "../config/db.js";
import { catchAsync } from "../middleware/errorHandler.js";
import AppError from "../utils/AppError.js";

// Get Notifications
export const getNotifications = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT n.*, 
     u.name AS actor_name, u.username AS actor_username, u.avatar AS actor_avatar,
     CASE 
       WHEN n.post_id IS NOT NULL THEN (SELECT content FROM posts WHERE id = n.post_id)
       ELSE NULL
     END AS post_content,
     CASE 
       WHEN n.comment_id IS NOT NULL THEN (SELECT content FROM comments WHERE id = n.comment_id)
       ELSE NULL
     END AS comment_content
     FROM notifications n
     JOIN users u ON n.actor_id = u.id
     WHERE n.user_id = $1
     ORDER BY n.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  res.json({
    success: true,
    data: result.rows,
  });
});

// Mark As Read
export const markNotificationsRead = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  // Mark all unread notifications for this user as read
  // OR optionally receive a list of IDs.
  // Standard 'mark all read' is simpler for typical usage.

  await pool.query(
    "UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false",
    [userId]
  );

  res.json({
    success: true,
    message: "Notifications marked as read",
  });
});

// Delete Notification
export const deleteNotification = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const result = await pool.query(
    "DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING *",
    [id, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError("Notification not found or you are not authorized", 404);
  }

  res.json({
    success: true,
    message: "Notification deleted",
  });
});
