console.log("SERVER FILE LOADED");


import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

// Import routes
//import authRoutes from "./routes/authRoutes.js";
import router from "./routes/authRoutes.js";
import shopRoutes from "./routes/shopRoutes.js";
import productRoutes from "./routes/productRoutes.js";
dotenv.config();
connectDB();

const app = express();
/* ✅ CORS — PUT IT HERE */
app.use(cors({
  origin: "*", // allow all for now (testing)
  credentials: true
}));

// Middleware
//app.use(cors());
app.use(express.json({ limit: "50mb" })); // Increased limit for Base64 images
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Eastlify API is running",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      shops: "/api/shops",
      products: "/api/products",
    },
  });
});

app.use("/api/auth", router);
app.use("/api/shops", shopRoutes);
app.use("/api/products", productRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);
/* ✅ Health check */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
