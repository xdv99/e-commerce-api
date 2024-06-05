const router = require("express").Router();
const auth = require("./auth");
const products = require("./products");
const cart = require("./cart");
const coupons = require("./coupons");
const orders = require("./orders");

router.use("/", auth);
router.use("/products", products);
router.use("/cart", cart);
router.use("/coupons", coupons);
router.use("/orders", orders);

module.exports = router;
