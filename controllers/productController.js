import Product from "../models/Product.js";
import Shop from "../models/Shop.js";

// Helper to parse numbers safely
const parseNumber = (value, defaultValue = undefined) => {
  if (value === null || value === undefined || value === '' || value === 'null' || value === 'undefined') {
    return defaultValue;
  }
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Shop Owner)
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      compareAtPrice,
      category,
      stock,
      inStock,
      tags,
    } = req.body;

    // Sanitize req.body for "undefined" and "null" strings
    Object.keys(req.body).forEach(key => {
      if (req.body[key] === 'undefined' || req.body[key] === 'null') {
        req.body[key] = undefined;
      }
    });

    // Get user's shop
    const shop = await Shop.findOne({ owner: req.user._id });

    if (!shop) {
      res.status(404);
      throw new Error("You need to create a shop first");
    }

    // Extract product images from Cloudinary (req.files)
    const images = req.files ? req.files.map(file => file.path) : [];

    // Create product
    const product = await Product.create({
      name,
      description,
      price: parseNumber(price, 0),
      compareAtPrice: parseNumber(compareAtPrice, undefined),
      category,
      images,
      shop: shop._id,
      stock: parseNumber(stock, 0),
      inStock: inStock === 'true' || inStock === true, 
      tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Create Product Backend Error:", error);
    console.error("Request Body:", req.body);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all products (with filters)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const {
      category,
      shop,
      search,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
    } = req.query;

    const query = { isActive: true };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by shop
    if (shop) {
      query.shop = shop;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Search by name, description, or tags
    if (search) {
      query.$text = { $search: search };
    }

    const products = await Product.find(query)
      .populate("shop", "shopName street phone")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "shop",
      "shopName street phone email whatsapp"
    );

    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Get my shop's products
// @route   GET /api/products/my/products
// @access  Private (Shop Owner)
export const getMyProducts = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });

    if (!shop) {
      res.status(404);
      throw new Error("You don't have a shop yet");
    }

    const products = await Product.find({ shop: shop._id }).sort({
      createdAt: -1,
    });

    res.json(products);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Shop Owner)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    // Check if user owns the shop that owns the product
    const shop = await Shop.findById(product.shop);
    if (shop.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to update this product");
    }

    // Prepare update data
    const updateData = { ...req.body };

    // Sanitize updateData: remove "undefined" and "null" strings
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === 'undefined' || updateData[key] === 'null') {
        delete updateData[key];
      }
    });

    // Handle JSON strings from multipart/form-data
    if (updateData.tags && typeof updateData.tags === 'string') {
      try {
        updateData.tags = JSON.parse(updateData.tags);
      } catch (e) {
        updateData.tags = [];
      }
    }
    
    if (updateData.inStock !== undefined) {
      updateData.inStock = updateData.inStock === 'true' || updateData.inStock === true;
    }
    if (updateData.price !== undefined) {
      updateData.price = parseNumber(updateData.price, 0);
    }
    if (updateData.compareAtPrice !== undefined) {
      updateData.compareAtPrice = parseNumber(updateData.compareAtPrice, null);
    }
    if (updateData.stock !== undefined) {
      updateData.stock = parseNumber(updateData.stock, 0);
    }

    // Handle images from req.body (existing URLs)
    let finalImages = [];
    
    // 1. Keep existing images sent from frontend
    if (req.body.existingImages) {
       if (Array.isArray(req.body.existingImages)) {
         finalImages = [...req.body.existingImages];
       } else {
         finalImages = [req.body.existingImages];
       }
    } else if (req.body.images) {
       // Multer might put single string fields in req.body.images if not files
       if (typeof req.body.images === 'string') {
          try {
            const parsed = JSON.parse(req.body.images);
            if (Array.isArray(parsed)) finalImages = parsed;
            else if (req.body.images.startsWith('http')) finalImages = [req.body.images];
          } catch (e) {
            if (req.body.images.startsWith('http')) finalImages = [req.body.images];
          }
       } else if (Array.isArray(req.body.images)) {
          finalImages = req.body.images.filter(img => typeof img === 'string' && img.startsWith('http'));
       }
    }

    // 2. Add new images from Cloudinary
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path);
      finalImages = [...finalImages, ...newImages];
    }
    
    updateData.images = finalImages.slice(0, 5);

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    console.error("Update Product Backend Error:", error);
    console.error("Request Body:", req.body);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Shop Owner)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    // Check if user owns the shop that owns the product
    const shop = await Shop.findById(product.shop);
    if (shop.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to delete this product");
    }

    await product.deleteOne();

    res.json({ message: "Product removed" });
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};
