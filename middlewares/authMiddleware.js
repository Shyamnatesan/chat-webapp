require("dotenv").config();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

module.exports.userVerification = (req, res, next) => {
  const token = req.headers.authorization;
  console.log(token);
  if (!token) {
    return res
      .status(401)
      .json({ status: false, message: "Authorization token not provided" });
  }
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
      return res.status(403).json({ status: false, message: "Invalid token" });
    } else {
      const user = await User.findById(data.id);
      if (user) {
        req.user = user;
        next();
      }
    }
  });
};
