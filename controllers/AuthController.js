const User = require("../models/User");
const { createSecretToken } = require("../utils/SecretToken");
const bcrypt = require("bcrypt");
const CustomError = require("../utils/errors/CustomError");

module.exports.Signup = async (req, res, next) => {
  const userDetails = req.body.userDetails;
  try {
    const existingUser = await User.findOne({ email: userDetails.email });
    if (existingUser) {
      throw new CustomError(400, "Bad Request: User already exists");
    }

    const newUser = new User(userDetails);
    await newUser.save();
    const token = createSecretToken(newUser._id);
    res.status(201).json({ status: true, token });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports.verifyToken = (req, res) => {
  res.json({ status: true, message: "Token verified", user: req.user });
};

module.exports.Login = async (req, res, next) => {
  const userDetails = req.body.userDetails;
  try {
    const user = await User.findOne({ email: userDetails.email });
    if (!user) {
      throw new CustomError(401, "Unauthorizzed: Email id does not exist");
    }

    const passwordMatch = await bcrypt.compare(
      userDetails.password,
      user.password
    );

    if (!passwordMatch) {
      throw new CustomError(401, "Unauthorized: Incorrect Password");
    }

    const token = createSecretToken(user._id);
    res.status(201).json({ status: true, token });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
