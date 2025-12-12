import express from "express";
import { authenticate } from "../../middleware/auth.js";
import {
  getNotifications,
  markNotificationsRead,
  deleteNotification,
} from "../../controllers/notificationController.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getNotifications);
router.put("/read", markNotificationsRead);
router.delete("/:id", deleteNotification);

export default router;
