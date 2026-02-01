import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide product name"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    price: {
      type: Number,
      required: [true, "Please provide product price"],
      min: 0,
    },
    compareAtPrice: {
      type: Number,
      min: 0,
    },
    category: {
      type: String,
      required: [true, "Please provide product category"],
    },
    images: [
      {
        type: String, // Base64 or URL
      },
    ],
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    variants: [
      {
        size: String,
        color: String,
        stock: { type: Number, default: 0 },
        inStock: { type: Boolean, default: true },
      },
    ],
    hasSizes: {
      type: Boolean,
      default: false,
    },
    hasColors: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search optimization
productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ shop: 1, category: 1 });
productSchema.index({ price: 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
