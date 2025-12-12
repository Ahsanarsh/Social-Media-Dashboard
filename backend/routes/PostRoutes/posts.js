import express from "express";
import { authenticate } from "../../middleware/auth.js";
import upload from "../../middleware/upload.js";
import {
  createPost,
  getFeed,
  getExplore,
  getPost,
  deletePost,
  likePost,
  unlikePost,
  repostPost,
  bookmarkPost,
  unbookmarkPost,
  updatePost,
} from "../../controllers/postController.js";
import {
  getPostComments,
  addComment,
} from "../../controllers/commentController.js";

const router = express.Router();

// Middleware to protect routes
router.use(authenticate);

router.post("/", upload.single("image"), createPost);
router.get("/feed", getFeed);
router.get("/explore", getExplore);
router.get("/:id", getPost);
router.delete("/:id", deletePost);
router.put("/:id", updatePost);

router.post("/:id/like", likePost);
router.delete("/:id/like", unlikePost);
router.post("/:id/repost", repostPost);
router.post("/:id/bookmark", bookmarkPost);
router.delete("/:id/bookmark", unbookmarkPost);

// Comment routes for this post
router.get("/:id/comments", getPostComments);
router.post("/:id/comments", addComment);

export default router;
