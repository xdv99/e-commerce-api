const Order = require("../models/orders");
const User = require("../models/user");
const Product = require("../models/product");
const Coupon = require("../models/coupons");
require("dotenv").config();

async function cartAdjust(user) {
  let total = 0;
  let profit = 0;
  let altered = false;
  for (let i = 0; i < user.cart.products.length; i++) {
    const product = user.cart.products[i];
    const productDoc = await Product.findById(product.product);

    // If product is not found, remove it from the cart
    if (!productDoc || productDoc.amount < 1) {
      user.cart.products.splice(i, 1);
      i--;
      altered = true;
      continue;
    }

    // If the available amount is less than that in the cart
    if (productDoc.amount < product.quantity) {
      user.cart.products[i].quantity = productDoc.amount;
      altered = true;
    }

    if (productDoc) {
      total += (product.quantity * productDoc.finalPrice).toFixed(2);
      profit +=
        product.quantity * (productDoc.finalPrice - productDoc.price.org);
    }
  }

  if (altered) await user.save();

  return {
    altered,
    total,
    profit,
  };
}

async function createOrder(user) {
  const cart = user.cart;

  const { altered, total, profit } = await cartAdjust(user);

  const order = new Order({
    user: user._id,
    products: cart.products,
    cost: {
      total,
      profit: profit.toFixed(2),
      wallet: 0,
      coupon: 0,
    },
  });

  if (cart.coupon) {
    const coupon = await Coupon.findById(cart.coupon);
    if (coupon && coupon.expire > Date.now() && coupon.used < coupon.limit)
      order.cost.coupon = (total * (coupon.value / 100)).toFixed(2);
  }

  if (cart.wallet) {
    order.cost.wallet =
      user.wallet > total - order.cost.coupon
        ? total - order.cost.coupon
        : user.wallet;
  }

  order.cost.delivery = user.location.distance * process.env.IQD_PER_KM;

  return { order, altered };
}

exports.check = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user.cart.products.length === 0)
    return res.status(400).json({ error: "Cart is empty" });

  try {
    const { order, altered } = await createOrder(user);
    if (altered) return res.status(409).json(order);
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.create = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user.cart.products.length === 0)
    return res.status(400).json({ error: "Cart is empty" });
  try {
    const { order, altered } = await createOrder(user);
    if (altered) return res.status(409).json(order);
    await order.save();

    if (order.cost.wallet > 0) user.wallet -= order.cost.wallet;
    user.cart.products = [];
    user.cart.coupon = null;
    user.cart.wallet = false;
    user.orders += 1;
    user.spent += order.finalCost - order.cost.delivery;
    user.spent += order.cost.total;
    await user.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    const user = req.user;
    if (user.role === "user" && order.user.toString() !== user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.get = async (req, res) => {
  try {
    const { page, user, delivery, status, sortBy, timeMin, timeMax } =
      req.query;
    const query = {};
    if (user) query.user = user;
    if (req.user.role === "user") query.user = req.user.id;
    if (delivery) query.delivery = delivery;
    if (status) query.state = { $in: status };
    if (timeMin) query.timestamp = { $gte: new Date(timeMin) };
    if (timeMax) {
      if (!timeMin) query.timestamp = { $lte: timeMax };
      if (timeMin)
        query.timestamp = {
          $gte: timeMin,
          $lte: timeMax,
        };
    }
    const sort = {};
    if (sortBy) {
      const options = sortBy.split(",");
      for (const option of options) {
        const [key, value] = option.split(":");
        sort[key] = value === "asc" ? 1 : -1;
      }
    }
    const pageNum = parseInt(page) || 0;

    const orders = await Order.find(query)
      .sort(sort)
      .skip(pageNum === 0 ? null : pageNum * 10)
      .limit(10);

    res.status(200).json({
      results: orders,
      nxtPage: orders.length === 10 ? pageNum + 1 : null,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status, delivery } = req.body;

  const data = { state: status };
  const user = req.user;

  if (user.role === "delivery" && status === "accepted")
    data.delivery = user.id;

  if (delivery && (user.role === "manager" || user.role === "admin")) {
    const user = await User.findById(delivery);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role !== "delivery")
      return res.status(403).json({ error: "User is not a delivery" });

    data.delivery = delivery;
  }

  try {
    const order = await Order.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
