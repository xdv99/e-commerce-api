const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
  },
  {
    _id: false,
  }
);

const costSchema = new mongoose.Schema(
  {
    total: {
      type: Number,
      required: [true, "Total is required"],
    },
    profit: {
      type: Number,
      required: [true, "Profit is required"],
    },
    delivery: Number,
    wallet: Number,
    coupon: Number,
  },
  {
    _id: false,
  }
);

const schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  products: {
    type: [productSchema],
    required: [true, "Products are required"],
  },
  cost: {
    type: costSchema,
    required: [true, "Cost is required"],
  },
  state: {
    type: String,
    enum: ["pending", "accepted", "rejected", "delivered"],
    default: "pending",
  },
  delivery: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

schema.virtual("finalCost").get(function () {
  let total = this.cost.total;
  if (this.cost.delivery) total += this.cost.delivery;
  if (this.cost.wallet !== null) total -= this.cost.wallet;
  if (this.cost.coupon !== null) total -= this.cost.coupon;
  return total;
});

module.exports = mongoose.model("Order", schema);
