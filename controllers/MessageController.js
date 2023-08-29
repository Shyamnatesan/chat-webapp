const Messages = require("../models/Messages");

module.exports.GetMessagesByRoomId = async (req, res, next) => {
  const roomId = req.params.roomId;
  const lastMessageTimestamp = req.query.lastMessageTimestamp;

  try {
    let query = { roomId };

    if (lastMessageTimestamp) {
      query.timestamp = {
        $lt: new Date(lastMessageTimestamp),
      };
    }

    const messagesInRoom = await Messages.find(query)
      .sort({ timestamp: -1 })
      .limit(20);

    res.status(200).json({ status: true, messages: messagesInRoom });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
