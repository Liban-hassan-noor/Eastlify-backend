import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    type: {
      type: String,
      enum: ["call", "whatsapp", "sale"],
      required: true,
    },
    detail: {
      type: String, // e.g., "KSh 5,000" or "+254..."
    },
    item: {
      type: String, // e.g., "Silk Dirac"
    },
    amount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for performance
activitySchema.index({ shop: 1, createdAt: -1 });

const Activity = mongoose.model("Activity", activitySchema);

export default Activity;
