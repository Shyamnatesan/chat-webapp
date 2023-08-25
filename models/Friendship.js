const mongoose = require("mongoose");

const friendshipSchema = new mongoose.Schema({
  requestSenderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  requestReceiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "declined"],
    required: true,
  },
  roomId: {
    type: String,
  },
});

const Friendship = mongoose.model("Friendship", friendshipSchema);

module.exports = Friendship;
