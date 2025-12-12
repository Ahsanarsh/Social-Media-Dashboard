import express from "express";
import { authenticate } from "../../middleware/auth.js";
import {
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
} from "../../controllers/commentController.js";

const router = express.Router();

router.use(authenticate);

// Update/Delete Comment
router.put("/:id", updateComment);
router.delete("/:id", deleteComment);

// Like/Unlike Comment
router.post("/:id/like", likeComment);
router.delete("/:id/like", unlikeComment);

export default router;
