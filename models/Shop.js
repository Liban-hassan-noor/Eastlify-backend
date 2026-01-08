import mongoose from "mongoose";

const shopSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      required: [true, "Please provide shop name"],
      trim: true,
    },
    ownerName: {
      type: String,
      required: [true, "Please provide owner name"],
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    categories: [
      {
        type: String,
        required: true,
      },
    ],
    street: {
      type: String,
      required: [true, "Please provide street location"],
      trim: true,
    },
    buildingFloor: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Please provide phone number"],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    whatsapp: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String, // Base64 or URL
    },
    coverImage: {
      type: String, // Base64 or URL
    },
    images: [
      {
        type: String, // Array of Base64 or URLs
      },
    ],
    workingHours: {
      open: {
        type: String,
        default: "08:00",
      },
      close: {
        type: String,
        default: "18:00",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search optimization
shopSchema.index({ shopName: "text", description: "text", categories: "text" });
shopSchema.index({ street: 1, categories: 1 });

const Shop = mongoose.model("Shop", shopSchema);

export default Shop;
