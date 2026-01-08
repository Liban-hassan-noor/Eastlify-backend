import express from "express";

const router = express.Router();
console.log("✅ AUTH ROUTES LOADED");


import {
  register,
  login,
  getProfile,
  updateProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

router.get("/ping", (req, res) => {
  res.json({ message: "Auth routes working" });
});

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.route("/profile").get(protect, getProfile).put(protect, updateProfile);





export default router;


