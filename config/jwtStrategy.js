const jsonwebtoken = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const privateKey = fs.readFileSync(
  path.join(__dirname, "..", "config", "cryptoKeys", "private.pem"),
  "utf8"
);
const publicKey = fs.readFileSync(
  path.join(__dirname, "..", "config", "cryptoKeys", "public.pem"),
  "utf8"
);

exports.jwtSign = (user) => {
  return jsonwebtoken.sign({ sub: user._id, role: user.role }, privateKey, {
    algorithm: "RS256",
  });
};

exports.jwtAuthenticate = (req, res, next) => {
  try {
    const [type, token] = req.headers.authorization.split(" ");
    if (type !== "Bearer") throw new Error("Invalid authentication type"); // Invalid Auth Type
    const user = jsonwebtoken.verify(token, publicKey, {
      algorithms: ["RS256"],
    });
    if (!user) throw new Error("Invalid token");
    req.user = {
      id: user.sub,
      role: user.role,
    };
  } catch (error) {}
  next();
};
