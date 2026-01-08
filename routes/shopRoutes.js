import express from "express";
import {
  createShop,
  getShops,
  getShopById,
  getMyShop,
  updateShop,
  deleteShop,
} from "../controllers/shopController.js";
import { protect, shopOwner } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getShops);

// Protected routes (specific paths BEFORE parameterized paths!)
router.get("/my/shop", protect, shopOwner, getMyShop);
router.post("/", protect, shopOwner, createShop);
router.get("/:id", getShopById);
router.put("/:id", protect, shopOwner, updateShop);
router.delete("/:id", protect, shopOwner, deleteShop);

export default router;
