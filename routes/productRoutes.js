import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  getMyProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, shopOwner } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Public routes
router.get("/", getProducts);

// Protected routes (specific paths BEFORE parameterized paths!)
router.get("/my/products", protect, shopOwner, getMyProducts);

router.post(
  "/",
  protect,
  shopOwner,
  upload.array("images", 5),
  createProduct
);

router.get("/:id", getProductById);

router.put(
  "/:id",
  protect,
  shopOwner,
  upload.array("images", 5),
  updateProduct
);

router.delete("/:id", protect, shopOwner, deleteProduct);

export default router;
