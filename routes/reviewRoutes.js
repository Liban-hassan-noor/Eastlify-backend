import express from "express";
import {
  createReview,
  getShopReviews,
  getReviewStats,
  flagReview,
  getAllReviews,
} from "../controllers/reviewController.js";

const router = express.Router();

// Public routes
router.post("/", createReview);
router.get("/shop/:shopId", getShopReviews);
router.get("/shop/:shopId/stats", getReviewStats);
router.post("/:reviewId/flag", flagReview);

// Admin routes (future - add auth middleware)
router.get("/admin", getAllReviews);

export default router;
