const User = require("../models/User");
const { createSecretToken } = require("../utils/SecretToken");
const bcrypt = require("bcrypt");

module.exports.Signup = async (req, res) => {
  const userDetails = req.body.userDetails;
  try {
    const existingUser = await User.findOne({ email: userDetails.email });
    if (!existingUser) {
      const newUser = new User(userDetails);
      await newUser.save();
      const token = createSecretToken(newUser._id);
      res.status(201).json({ status: true, token });
    } else {
      res.status(201).json({ status: false, message: "User already exists" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

module.exports.verifyToken = (req, res) => {
  res.json({ status: true, message: "Token verified" });
};

module.exports.Login = async (req, res) => {
  const userDetails = req.body.userDetails;
  try {
    const user = await User.findOne({ email: userDetails.email });
    if (user) {
      const passwordMatch = await bcrypt.compare(
        userDetails.password,
        user.password
      );
      if (passwordMatch) {
        console.log("its a match");
        const token = createSecretToken(user._id);
        console.log(token);
        res.status(201).json({ status: true, token });
      } else {
        res.status(201).json({ status: false, message: "Incorrect Password" });
      }
    } else {
      res
        .status(201)
        .json({ status: false, message: "Email id does not exist" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

module.exports.SearchUsers = async (req, res) => {
  const { q, page, perPage } = req.query;
  const skip = (page - 1) * perPage;
  const searchQuery = {
    $or: [
      { fullName: { $regex: q, $options: "i" } },
      { phonenumber: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ],
  };
  try {
    const [users, totalUsers] = await Promise.all([
      User.find(searchQuery).skip(skip).limit(parseInt(perPage)),
      User.countDocuments(searchQuery),
    ]);
    res.status(201).json({ users, totalUsers });
  } catch (error) {
    console.error("Error fetching search results:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching search results" });
  }
};