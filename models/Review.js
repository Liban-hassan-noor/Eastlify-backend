import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: [true, "Review must belong to a shop"],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // Optional - allows anonymous reviews
    },
    rating: {
      type: Number,
      required: [true, "Please provide a rating"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"],
    },
    reviewText: {
      type: String,
      trim: true,
      maxlength: [1000, "Review text cannot exceed 1000 characters"],
    },
    interactionType: {
      type: String,
      enum: {
        values: ["walk-in", "online-inquiry", "repeat-customer", "other"],
        message: "Invalid interaction type",
      },
    },
    // Future moderation features
    isVerified: {
      type: Boolean,
      default: false,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    flagReason: {
      type: String,
      trim: true,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    // Track IP for abuse prevention (anonymous reviews)
    ipAddress: {
      type: String,
      select: false, // Don't return by default
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient shop-specific queries sorted by date
reviewSchema.index({ shop: 1, createdAt: -1 });

// Index for filtering by rating
reviewSchema.index({ shop: 1, rating: 1 });

// Static method to calculate shop rating
reviewSchema.statics.calcAverageRating = async function (shopId) {
  const stats = await this.aggregate([
    {
      $match: { shop: shopId, isFlagged: false },
    },
    {
      $group: {
        _id: "$shop",
        avgRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model("Shop").findByIdAndUpdate(shopId, {
      rating: Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal
      totalReviews: stats[0].totalReviews,
    });
  } else {
    // No reviews, reset to 0
    await mongoose.model("Shop").findByIdAndUpdate(shopId, {
      rating: 0,
      totalReviews: 0,
    });
  }
};

// Update shop rating after save
reviewSchema.post("save", function () {
  this.constructor.calcAverageRating(this.shop);
});

// Update shop rating after remove
reviewSchema.post("remove", function () {
  this.constructor.calcAverageRating(this.shop);
});

// Update shop rating after findOneAndDelete
reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRating(doc.shop);
  }
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
