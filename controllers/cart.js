const Product = require("../models/product");
const User = require("../models/user");

// Add to cart
exports.addProduct = async (req, res) => {
  const { productId } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });
    if (product.quantity < 1)
      return res.status(400).json({ error: "Product out of stock" });
    const user = await User.findById(req.user.id);
    const index = user.cart.products.findIndex(
      (p) => p.product.toString() === productId
    );
    if (index !== -1) {
      user.cart.products[index].quantity += 1;
    } else {
      user.cart.products.push({ product: productId, quantity: 1 });
    }
    await user.save();
    res.status(200).json(user.cart);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.checkCoupon = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (user.cart.coupon)
    return res.status(400).json({ error: "Coupon already applied" });
  next();
};

exports.applyCoupon = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.cart.coupon = req.coupon;
    await user.save();
    res.status(200).json(user.cart);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.toggleWallet = async (req, res) => {
  const { wallet } = req.body;
  try {
    const user = await User.findById(req.user.id);
    user.cart.wallet = wallet;
    await user.save();
    res.status(200).json(user.cart);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
