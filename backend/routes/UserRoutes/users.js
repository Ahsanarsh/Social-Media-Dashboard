import express from "express";
import { authenticate } from "../../middleware/auth.js";
import upload from "../../middleware/upload.js";
import {
  getUserProfile,
  getUserPosts,
  getUserLikedPosts,
  getUserBookmarkedPosts,
  getFollowers,
  getFollowing,
  updateProfile,
  followUser,
  unfollowUser,
} from "../../controllers/userController.js";
import { getUserComments } from "../../controllers/commentController.js";

const router = express.Router();

router.use(authenticate);

router.get("/:username", getUserProfile);
router.get("/:id/posts", getUserPosts);
router.get("/:id/liked", getUserLikedPosts);
router.get("/:id/bookmarks", getUserBookmarkedPosts);
router.get("/:id/comments", getUserComments);
router.get("/:id/followers", getFollowers);
router.get("/:id/following", getFollowing);

// Update Profile with possible file uploads
router.put(
  "/profile",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "cover_photo", maxCount: 1 },
  ]),
  updateProfile
);

router.post("/:id/follow", followUser);
router.delete("/:id/follow", unfollowUser);

export default router;
