const mongoose = require("mongoose");

const priceSchema = new mongoose.Schema(
  {
    org: {
      type: Number,
      required: [true, "Original price is required"],
    },
    net: {
      type: Number,
      required: [true, "Net price is required"],
    },
    discount: Number,
  },
  {
    _id: false,
  }
);

const nutritionSchema = new mongoose.Schema(
  {
    protein: Number,
    fat: Number,
    carb: Number,
    calories: Number,
  },
  {
    _id: false,
  }
);

const timestampSchema = new mongoose.Schema(
  {
    production: Date,
    expDate: Date,
    expTxt: String,
  },
  {
    _id: false,
  }
);

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
  },
  description: String,
  category: [String],
  amount: {
    type: Number,
    required: [true, "Amount is required"],
  },
  image: {
    type: String,
    required: [true, "Image is required"],
  },
  price: {
    type: priceSchema,
    required: [true, "Price is required"],
  },
  orders: {
    type: Number,
    default: 0,
  },
  nutrition: nutritionSchema,
  timestamp: timestampSchema,
});

schema.virtual("finalPrice").get(function () {
  if (this.price.discount) {
    return this.price.net - (this.price.net * this.price.discount) / 100;
  }
  return this.price.net;
});

module.exports = mongoose.model("Product", schema);
