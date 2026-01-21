import Shop from "../models/Shop.js";
import Activity from "../models/Activity.js";
import User from "../models/User.js";

// @desc    Create a new shop
// @route   POST /api/shops
// @access  Private (Shop Owner)
export const createShop = async (req, res) => {
  try {
    const {
      shopName,
      description,
      categories,
      street,
      buildingFloor,
      phone,
      email,
      whatsapp,
      workingHours,
    } = req.body;

    // Check if user already has a shop
    const existingShop = await Shop.findOne({ owner: req.user._id });
    if (existingShop) {
      res.status(400);
      throw new Error("You already have a shop registered");
    }

    // Extract images from Cloudinary (req.files)
    let profileImage = "";
    let coverImage = "";

    if (req.files) {
      if (req.files.profileImage) {
        profileImage = req.files.profileImage[0].path;
      }
      if (req.files.coverImage) {
        coverImage = req.files.coverImage[0].path;
      }
    }

    // Create shop
    const shop = await Shop.create({
      shopName,
      owner: req.user._id,
      description,
      categories: categories ? (typeof categories === 'string' ? JSON.parse(categories) : categories) : [],
      street,
      buildingFloor,
      phone,
      email,
      whatsapp,
      profileImage,
      coverImage,
      workingHours: workingHours ? (typeof workingHours === 'string' ? JSON.parse(workingHours) : workingHours) : undefined,
    });

    // Update user's shop reference
    await User.findByIdAndUpdate(req.user._id, { shop: shop._id });

    res.status(201).json(shop);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Get all shops (with filters)
// @route   GET /api/shops
// @access  Public
export const getShops = async (req, res) => {
  try {
    const { category, street, search, page = 1, limit = 20 } = req.query;

    const query = { isActive: true };

    // Filter by category
    if (category) {
      query.categories = category;
    }

    // Filter by street
    if (street) {
      query.street = street;
    }

    // Search by name or description
    
    if (search) {
  query.$or = [
    { shopName: { $regex: search, $options: "i" } },
    { description: { $regex: search, $options: "i" } },
  ];
}


   const shops = await Shop.find(query)
  .populate("owner", "name email phone")
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(Number(limit))
  .lean();


    const count = await Shop.countDocuments(query);

    res.json({
      shops,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single shop by ID
// @route   GET /api/shops/:id
// @access  Public
export const getShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate(
      "owner",
      "name email phone"
    );

    if (shop) {
      res.json(shop);
    } else {
      res.status(404);
      throw new Error("Shop not found");
    }
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Get my shop
// @route   GET /api/shops/my/shop
// @access  Private (Shop Owner)
export const getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });

    if (shop) {
      res.json(shop);
    } else {
      res.status(404);
      throw new Error("You don't have a shop yet");
    }
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Update shop
// @route   PUT /api/shops/:id
// @access  Private (Shop Owner)
export const updateShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      res.status(404);
      throw new Error("Shop not found");
    }

    // Check if user owns the shop
    if (shop.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to update this shop");
    }

    console.log("--- DEBUG: Update Shop START ---");
    console.log("Shop ID:", req.params.id);
    console.log("Files received:", req.files ? Object.keys(req.files) : "none");
    console.log("Body fields:", Object.keys(req.body));

    // Prepare update data
    const updateData = { ...req.body };
    
    // Exclude fields that shouldn't be updated directly
    const fieldsToExclude = ["_id", "owner", "createdAt", "updatedAt", "__v", "isVerified", "isActive"];
    fieldsToExclude.forEach((field) => delete updateData[field]);

    // Sanitize updateData: remove "undefined" and "null" strings
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === 'undefined' || updateData[key] === 'null') {
        delete updateData[key];
      }
    });

    // Handle JSON strings from multipart/form-data
    if (typeof updateData.categories === 'string') {
      try {
        updateData.categories = JSON.parse(updateData.categories);
      } catch (e) {
        console.error("Failed to parse categories:", e);
      }
    }
    if (typeof updateData.workingHours === 'string') {
      try {
        updateData.workingHours = JSON.parse(updateData.workingHours);
      } catch (e) {
        console.error("Failed to parse workingHours:", e);
      }
    }

    // Handle images: Priority to newly uploaded files
    if (req.files) {
      if (req.files.profileImage && req.files.profileImage[0]) {
        console.log("Updating profileImage with new file:", req.files.profileImage[0].path);
        updateData.profileImage = req.files.profileImage[0].path;
      }
      if (req.files.coverImage && req.files.coverImage[0]) {
        console.log("Updating coverImage with new file:", req.files.coverImage[0].path);
        updateData.coverImage = req.files.coverImage[0].path;
      }
    }

    // Ensure we don't clear images if they aren't provided in body OR files
    // But if they ARE provided as an empty string in the body, it means "remove"
    if (updateData.profileImage === undefined && (!req.files || !req.files.profileImage)) {
      delete updateData.profileImage;
    }
    if (updateData.coverImage === undefined && (!req.files || !req.files.coverImage)) {
      delete updateData.coverImage;
    }

    console.log("Final updateData fields:", Object.keys(updateData));
    if (updateData.profileImage) console.log("Final profileImage value (truncated):", updateData.profileImage.substring(0, 50) + "...");
    if (updateData.coverImage) console.log("Final coverImage value (truncated):", updateData.coverImage.substring(0, 50) + "...");

    // Update shop fields
    const updatedShop = await Shop.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log("Shop updated successfully");
    console.log("--- DEBUG: Update Shop END ---");
    res.json(updatedShop);
  } catch (error) {
    console.error("Update Shop Error:", error);
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Delete shop
// @route   DELETE /api/shops/:id
// @access  Private (Shop Owner)
export const deleteShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      res.status(404);
      throw new Error("Shop not found");
    }

    // Check if user owns the shop
    if (shop.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to delete this shop");
    }

    await shop.deleteOne();

    // Remove shop reference from user
    await User.findByIdAndUpdate(req.user._id, { shop: null });

    res.json({ message: "Shop removed" });
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Record shop activity (Call/WhatsApp/Sale)
// @route   POST /api/shops/:id/activity
// @access  Public (for calls/whatsapp) or Private (for sales)
export const recordActivity = async (req, res) => {
  try {
    const { type, detail, item, amount } = req.body;
    const shopId = req.params.id;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      res.status(404);
      throw new Error("Shop not found");
    }

    // Logic for different activity types
    if (type === "call" || type === "whatsapp") {
      shop.totalCalls += 1;
    } else if (type === "sale") {
      // Sales should be authenticated (only owner can record sales for their shop)
      if (!req.user || shop.owner.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error("Only shop owners can record sales");
      }
      shop.sales += Number(amount) || 0;
      shop.orders += 1;
    }

    await shop.save();

    // Create activity record
    const activity = await Activity.create({
      shop: shopId,
      type,
      detail,
      item,
      amount: Number(amount) || 0,
    });

    res.status(201).json({
      success: true,
      shop: {
        totalCalls: shop.totalCalls,
        sales: shop.sales,
        orders: shop.orders,
      },
      activity,
    });
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Get shop activities
// @route   GET /api/shops/:id/activities
// @access  Private (Shop Owner)
export const getActivities = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      res.status(404);
      throw new Error("Shop not found");
    }

    if (shop.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to view these activities");
    }

    const activities = await Activity.find({ shop: req.params.id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(activities);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

