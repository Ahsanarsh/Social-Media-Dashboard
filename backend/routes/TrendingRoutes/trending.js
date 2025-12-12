import express from "express";
import { authenticate } from "../../middleware/auth.js";
import {
  getTrendingHashtags,
  getTrendingPosts,
  getFollowSuggestions,
} from "../../controllers/trendingController.js";

const router = express.Router();

router.use(authenticate);

router.get("/hashtags", getTrendingHashtags);
router.get("/posts", getTrendingPosts);
router.get("/suggestions/users", getFollowSuggestions);

export default router;
