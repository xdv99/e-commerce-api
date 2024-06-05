const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      minLength: [8, "Address must be at least 8 characters"],
    },
    gps: {
      type: {
        lat: Number,
        lng: Number,
      },
      _id: false,
    },
    distance: Number,
    duration: Number,
  },
  {
    _id: false,
  }
);

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

const cartSchema = new mongoose.Schema(
  {
    products: [productSchema],
    coupon: {
      type: mongoose.Types.ObjectId,
      ref: "Coupon",
    },
    wallet: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

const schema = new mongoose.Schema({
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    unique: [true, "Phone number already exists"],
    validate: {
      validator: function (v) {
        return /\+964\d{10}/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number`,
    },
  },
  name: String,
  location: locationSchema,
  wallet: {
    type: Number,
    default: 0,
    min: 0,
  },
  orders: {
    type: Number,
    default: 0,
  },
  spent: {
    type: Number,
    default: 0,
    min: 0,
  },
  role: {
    type: String,
    enum: ["admin", "user", "delivery", "manager"],
    default: "user",
  },
  cart: {
    type: cartSchema,
    default: {},
  },
});

module.exports = mongoose.model("User", schema);
