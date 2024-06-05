require("dotenv").config();

const mongoose = require("mongoose");

module.exports = () => {
  mongoose.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
      delete ret._id;
      return ret;
    },
  });
  mongoose.connect(process.env.DB_URL);
  const db = mongoose.connection;
  db.once("open", () => {
    console.log("DB Connected");
  });
  db.on("error", (err) => {
    console.log("Database connection error: ", err);
  });
};
