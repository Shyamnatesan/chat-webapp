const Messages = require("../models/Messages");

module.exports.GetMessagesByRoomId = async (req, res) => {
  console.log("received the request");
  const roomId = req.params.roomId;
  const lastMessageTimestamp = req.query.lastMessageTimestamp;
  console.log("this is the roomID", roomId);
  try {
    let query = { roomId };

    if (lastMessageTimestamp) {
      query.timestamp = { $lt: new Date(lastMessageTimestamp) };
    }

    const messagesInRoom = await Messages.find(query)
      .sort({ timestamp: -1 })
      .limit(20);

    console.log(messagesInRoom);
    res.status(200).json({ status: true, messages: messagesInRoom });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: false, error: "error occured while fetching messages" });
  }
};
