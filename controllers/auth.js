const UserModel = require("../models/user");
const { jwtSign } = require("../config/jwtStrategy");

function formatPhoneNumber(phone) {
  let result = phone;
  if (phone.length === 11) {
    result = phone.slice(1);
  }
  return `+964${result}`;
}

const loginOrSignUp = async (phone) => {
  const user = await UserModel.findOne({ phone });
  if (user) {
    // Login
    return jwtSign(user);
  } else {
    // Sign Up
    const newUser = new UserModel({ phone });
    await newUser.save();
    return jwtSign(newUser);
  }
};

exports.requestOTP = (req, res) => {
  const { phone, channel } = req.body;
  // TODO: Send Request to Twilio
  try {
    res.status(200).json({
      to: formatPhoneNumber(phone),
      channel: channel,
      status: "pending",
    });
  } catch (error) {
    res.status(400).json({ error: "Invalid Phone Number" });
  }
};

exports.verifyOTP = async (req, res) => {
  const { phone, otp } = req.body;
  // TODO: Send Request to Twilio
  try {
    if (otp === 253563) {
      const token = await loginOrSignUp(formatPhoneNumber(phone));
      res.status(200).json({ token });
    } else {
      throw new Error("Invalid OTP");
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Invalid OTP" });
  }
};

exports.isAuthenticated = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

exports.isNotAuthenticated = (req, res, next) => {
  if (!req.user) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

exports.isManager = (req, res, next) => {
  if (req.user && (req.user.role === "manager" || req.user.role === "admin")) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

exports.isOwner = (req, res, next) => {
  const { id } = req.params;
  if (req.user && req.user.id === id) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

exports.isOwnerOrManger = (req, res, next) => {
  const { id } = req.params;
  if (
    req.user &&
    (req.user.id === id ||
      req.user.role === "manager" ||
      req.user.role === "admin")
  ) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

exports.isDelivery = (req, res, next) => {
  if (req.user && req.user.role === "delivery") {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

exports.isDeliveryOrManager = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "delivery" ||
      req.user.role === "manager" ||
      req.user.role === "admin")
  ) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};
