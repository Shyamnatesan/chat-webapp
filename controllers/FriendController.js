const Friendship = require("../models/Friendship");
const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");

module.exports.SendFriendRequest = async (req, res) => {
  try {
    const requestSenderId = req.user._id.toString();
    const { requestReceiverId } = req.body;
    const newFriendShip = new Friendship({
      requestSenderId,
      requestReceiverId,
      status: "pending",
    });
    await newFriendShip.save();
    res
      .status(200)
      .json({ status: true, message: "Friend request sent successfully." });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred while sending the friend request." });
  }
};

module.exports.SentRequests = async (req, res) => {
  const requestSenderId = req.user._id.toString();
  try {
    const sentRequests = await Friendship.find(
      {
        requestSenderId,
        status: { $in: ["pending", "accepted"] },
      },
      {
        requestReceiverId: 1,
        status: 1,
      }
    );

    console.log(sentRequests);
    res.status(200).json({
      status: true,
      data: sentRequests.map((request) => {
        return {
          requestReceiverId: request.requestReceiverId.toString(),
          status: request.status,
        };
      }),
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occured while fetching the sent requests" });
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

module.exports.PendingRequests = async (req, res) => {
  // userA(requestSenderId) -> userB(requestReceiverId) -> status(pending)
  // userB logsin to check his pending requests
  const { page, perPage } = req.query;
  const skip = (page - 1) * perPage;
  const requestReceiverId = req.user._id.toString();
  const searchQuery = {
    requestReceiverId: requestReceiverId,
    status: "pending",
  };
  try {
    const [pendingRequests, totalPendingRequests] = await Promise.all([
      Friendship.find(searchQuery).skip(skip).limit(perPage),
      Friendship.countDocuments(searchQuery),
    ]);
    console.log(pendingRequests);
    console.log(totalPendingRequests);
    res.status(200).json({
      status: true,
      data: pendingRequests,
      totalPendingRequests: totalPendingRequests,
    });
  } catch (error) {
    console.log("error occured while fetching pending requests", error);

    res
      .status(500)
      .json({ error: "error occured while fetching pending requests" });
  }
};

module.exports.FindUserByIds = async (req, res) => {
  const { userIds } = req.body;
  try {
    const users = await User.find({ _id: { $in: userIds } });
    res.status(200).json({ status: true, data: users });
  } catch (error) {
    console.log("error occured while fetching users", error);
    res.status(500).json({ error: "error occured while fetching users" });
  }
};

module.exports.HandleFriendRequestAction = async (req, res) => {
  const requestReceiverId = req.user._id.toString();
  const { requestSenderId, action } = req.body;
  try {
    let updatedFriendRequest;
    if (action === "ACCEPT") {
      const roomId = uuidv4();
      updatedFriendRequest = await Friendship.findOneAndUpdate(
        { requestSenderId, requestReceiverId, status: "pending" },
        { $set: { status: "accepted", roomId } },
        { $new: true }
      );
    } else if (action === "DECLINE") {
      updatedFriendRequest = await Friendship.findOneAndUpdate(
        { requestSenderId, requestReceiverId, status: "pending" },
        { $set: { status: "declined" } },
        { $new: true }
      );
    } else {
      res.status(400).json({
        status: false,
        message: "Invalid action provided",
      });
    }

    if (!updatedFriendRequest) {
      return res.status(404).json({
        status: false,
        message: "Request not found or already processed",
      });
    }

    res.status(200).json({ status: true, data: updatedFriendRequest });
  } catch (error) {
    console.log("Error handling friend request:", error);
    return res
      .status(500)
      .json({ status: false, error: "Error handling friend request" });
  }
};

module.exports.GetFriends = async (req, res) => {
  const userId = req.user._id.toString();
  // this the current user's id
  console.log(userId);
  try {
    const friends = await Friendship.find({
      $and: [
        { $or: [{ requestSenderId: userId }, { requestReceiverId: userId }] },
        { status: "accepted" },
      ],
    });

    const friendIds = friends.map((friend) => {
      return friend.requestSenderId.toString() === userId
        ? friend.requestReceiverId.toString()
        : friend.requestSenderId.toString();
    });

    const friendsData = await User.find({ _id: { $in: friendIds } });

    console.log(friendsData);
    res.status(200).json({ status: true, data: friendsData });
  } catch (error) {
    console.error("Error fetching user friends:", error);
    res.status(500).json({ error: "Error fetching user friends" });
  }
};

module.exports.GetRoomId = async (req, res) => {
  const userAId = req.user._id.toString();
  const userBId = req.body.user._id.toString();
  console.log(userAId, userBId);

  try {
    const friendship = await Friendship.find({
      status: "accepted",
      $or: [
        {
          requestSenderId: userAId,
          requestReceiverId: userBId,
        },
        {
          requestSenderId: userBId,
          requestReceiverId: userAId,
        },
      ],
    });

    console.log(friendship[0]);
    res.status(200).json({ status: true, roomId: friendship[0].roomId });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: false, error: "error occured while fetching roomId" });
  }
};
