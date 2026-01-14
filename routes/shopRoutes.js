import express from "express";
import {
  createShop,
  getShops,
  getShopById,
  getMyShop,
  updateShop,
  deleteShop,
  recordActivity,
  getActivities,
} from "../controllers/shopController.js";
import { protect, shopOwner } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Public routes
router.get("/", getShops);

// Protected routes (specific paths BEFORE parameterized paths!)
router.get("/my/shop", protect, shopOwner, getMyShop);

router.post(
  "/",
  protect,
  shopOwner,
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  createShop
);

router.get("/:id", getShopById);

router.put(
  "/:id",
  protect,
  shopOwner,
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  updateShop
);

router.post("/:id/activity", recordActivity); // Public for calls/whatsapp
router.post("/:id/sale", protect, shopOwner, recordActivity); // Protected for sales
router.get("/:id/activities", protect, shopOwner, getActivities);

router.delete("/:id", protect, shopOwner, deleteShop);

export default router;
