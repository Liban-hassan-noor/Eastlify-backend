import Product from "../models/Product.js";
import Shop from "../models/Shop.js";

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
      images,
      stock,
      inStock,
      tags,
    } = req.body;

    // Get user's shop
    const shop = await Shop.findOne({ owner: req.user._id });

    if (!shop) {
      res.status(404);
      throw new Error("You need to create a shop first");
    }

    // Create product
    const product = await Product.create({
      name,
      description,
      price,
      compareAtPrice,
      category,
      images,
      shop: shop._id,
      stock,
      inStock,
      tags,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
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

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
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
