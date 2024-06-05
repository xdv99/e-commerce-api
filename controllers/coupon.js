const Coupon = require("../models/coupons");

exports.get = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.create = async (req, res) => {
  const coupon = new Coupon(req.body);
  try {
    const savedCoupon = await coupon.save();
    res.status(201).json(savedCoupon);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedCoupon)
      return res.status(404).json({ error: "Coupon not found" });
    res.status(200).json(updatedCoupon);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.delete = async (req, res) => {
  try {
    const deletedCoupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!deletedCoupon)
      return res.status(404).json({ error: "Coupon not found" });
    res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.apply = async (req, res, next) => {
  const { code } = req.body;
  try {
    const coupon = await Coupon.findOne({ code });
    if (!coupon) return res.status(404).json({ error: "Coupon not found" });

    if (!coupon.isActive)
      return res.status(400).json({ error: "Coupon not active" });

    if (coupon.expire < Date.now())
      return res.status(400).json({ error: "Coupon expired" });

    if (coupon.used === coupon.limit)
      return res.status(400).json({ error: "Coupon limit reached" });

    coupon.used++;
    await coupon.save();
    req.coupon = coupon._id;
    next();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
