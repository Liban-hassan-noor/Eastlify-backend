import Review from "../models/Review.js";
import Shop from "../models/Shop.js";

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Public (allows anonymous reviews)
export const createReview = async (req, res) => {
  try {
    const { shopId, rating, reviewText, interactionType, userId } = req.body;

    // Validate shop exists
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Get IP address for abuse tracking
    const ipAddress =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    // Create review
    const review = await Review.create({
      shop: shopId,
      user: userId || undefined,
      rating,
      reviewText: reviewText?.trim(),
      interactionType,
      ipAddress,
    });

    // Populate user info if available
    await review.populate("user", "name");

    res.status(201).json({
      success: true,
      message: "Review submitted successfully! Thank you for helping the Eastleigh community.",
      data: review,
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit review",
      error: error.message,
    });
  }
};

// @desc    Get reviews for a shop
// @route   GET /api/reviews/shop/:shopId
// @access  Public
export const getShopReviews = async (req, res) => {
  try {
    const { shopId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || "-createdAt"; // Default: newest first

    // Validate shop exists
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    // Build query - exclude flagged reviews from public view
    const query = { shop: shopId, isFlagged: false };

    // Get total count
    const total = await Review.countDocuments(query);

    // Get paginated reviews
    const reviews = await Review.find(query)
      .populate("user", "name")
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get shop reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};

// @desc    Get review statistics for a shop
// @route   GET /api/reviews/shop/:shopId/stats
// @access  Public
export const getReviewStats = async (req, res) => {
  try {
    const { shopId } = req.params;

    // Validate shop exists
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    // Get rating distribution
    const distribution = await Review.aggregate([
      {
        $match: { shop: shop._id, isFlagged: false },
      },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);

    // Format distribution as object
    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };
    distribution.forEach((item) => {
      ratingDistribution[item._id] = item.count;
    });

    // Get recent reviews (last 5)
    const recentReviews = await Review.find({
      shop: shopId,
      isFlagged: false,
    })
      .populate("user", "name")
      .sort("-createdAt")
      .limit(5)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        averageRating: shop.rating || 0,
        totalReviews: shop.totalReviews || 0,
        ratingDistribution,
        recentReviews,
      },
    });
  } catch (error) {
    console.error("Get review stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch review statistics",
      error: error.message,
    });
  }
};

// @desc    Flag a review for moderation
// @route   POST /api/reviews/:reviewId/flag
// @access  Public
export const flagReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Update flag status
    review.isFlagged = true;
    review.flagReason = reason?.trim();
    await review.save();

    res.status(200).json({
      success: true,
      message: "Review flagged for moderation. Thank you for keeping Eastlify safe.",
    });
  } catch (error) {
    console.error("Flag review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to flag review",
      error: error.message,
    });
  }
};

// @desc    Get all reviews (admin only - future)
// @route   GET /api/reviews/admin
// @access  Private/Admin
export const getAllReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const flaggedOnly = req.query.flagged === "true";

    const query = flaggedOnly ? { isFlagged: true } : {};

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate("user", "name email")
      .populate("shop", "shopName")
      .sort("-createdAt")
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};
