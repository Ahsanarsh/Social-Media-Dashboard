import express from "express";
import { authenticate } from "../../middleware/auth.js";
import {
  searchAll,
  searchUsers,
  searchPosts,
  searchHashtags,
} from "../../controllers/searchController.js";

const router = express.Router();

router.use(authenticate);

// Combined search (users + posts)
router.get("/", searchAll);

// Individual searches
router.get("/users", searchUsers);
router.get("/posts", searchPosts);
router.get("/hashtags", searchHashtags);

export default router;
