const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, "Code is required"],
    unique: [true, "Code already exists"],
  },
  value: {
    type: Number,
    min: [0, "Discount must be greater than or equal to 0"],
    max: [100, "Discount must be less than or equal to 100"],
    required: [true, "Discount is required"],
  },
  limit: {
    type: Number,
    min: [0, "Limit must be greater than or equal to 0"],
  },
  used: {
    type: Number,
    default: 0,
  },
  expire: Date,
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Coupon", schema);
