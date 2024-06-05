const ProductModel = require("../models/product");
const sharp = require("sharp");
const { join } = require("path");
const { exec } = require("child_process");

exports.getProducts = async (req, res) => {
  const {
    page,
    name,
    category,
    minPrice,
    maxPrice,
    minAmount,
    maxAmount,
    minOrders,
    maxOrders,
    expire,
    sortBy,
  } = req.query;

  try {
    // Querying
    const query = {};
    if (name) query.name = new RegExp(name, "i");
    if (category) query.category = { $in: category };
    if (minPrice) query["price.net"] = { $gte: parseInt(minPrice) };
    if (maxPrice) {
      if (!minPrice) query["price.net"] = { $lte: parseInt(maxPrice) };
      if (minPrice)
        query["price.net"] = {
          $gte: parseInt(minPrice),
          $lte: parseInt(maxPrice),
        };
    }
    if (minAmount) query.amount = { $gte: parseInt(minAmount) };
    if (maxAmount) {
      if (!minAmount) query.amount = { $lte: parseInt(maxAmount) };
      if (minAmount)
        query.amount = {
          $gte: parseInt(minAmount),
          $lte: parseInt(maxAmount),
        };
    }
    if (minOrders) query.orders = { $gte: parseInt(minOrders) };
    if (maxOrders) {
      if (!minOrders) query.orders = { $lte: parseInt(maxOrders) };
      if (minOrders)
        query.orders = {
          $gte: parseInt(minOrders),
          $lte: parseInt(maxOrders),
        };
    }
    if (expire) query["timestamp.expDate"] = { $lte: expire };

    // Sorting
    const sort = {};
    if (sortBy) {
      const options = sortBy.split(",");
      for (const option of options) {
        const [key, value] = option.split(":");
        sort[key] = value === "asc" ? 1 : -1;
      }
    }

    const pageNum = parseInt(page) || 0;
    const results = await ProductModel.find(query)
      .sort(sort)
      .skip(pageNum === 0 ? null : pageNum * 10)
      .limit(10);
    res
      .status(200)
      .json({ results, nxtPage: results.length === 10 ? pageNum + 1 : null });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await ProductModel.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.addProduct = async (req, res) => {
  const { price, timestamp } = req.body;

  if (price && price.org > price.net) {
    return res.status(400).json({
      error: "Orginal price cannot be greater than net price",
    });
  }

  if (
    timestamp &&
    timestamp.production &&
    timestamp.expDate &&
    timestamp.production > timestamp.expDate
  ) {
    return res.status(400).json({
      error: "Production date cannot be greater than expiration date",
    });
  }

  try {
    const product = new ProductModel(req.body);

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateProduct = async (req, res) => {
  const { price, timestamp } = req.body;

  if (price && price.org > price.net) {
    return res.status(400).json({
      error: "Orginal price cannot be greater than net price",
    });
  }

  if (
    timestamp &&
    timestamp.production &&
    timestamp.expDate &&
    timestamp.production > timestamp.expDate
  ) {
    return res.status(400).json({
      error: "Production date cannot be greater than expiration date",
    });
  }

  const { id } = req.params;
  try {
    const product = await ProductModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!product) {
      return res.status(400).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await ProductModel.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.uploadProductImg = async (req, res) => {
  try {
    const { filename, path } = req.file;
    const newName = filename.split(".")[0] + ".webp";
    await sharp(path)
      .resize(300)
      .toFormat("webp")
      .toFile(join(__dirname, "..", "public", "products", newName));
    exec(`del ${path}`);
    res.status(201).json({ Image: newName });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
