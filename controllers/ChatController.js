const Messages = require("../models/Messages");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`a user with ${socket.id} connected`);

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on("sendMessage", async (data) => {
      console.log("Message received:", data);

      const newMessage = new Messages({
        roomId: data.roomId, // Store the roomId
        senderId: data.senderId,
        recipientId: data.recipientId,
        message: data.message,
      });

      try {
        await newMessage.save();
        console.log("message successfully saved in the database");
      } catch (error) {
        console.log("error occured while storing the message");
      }

      io.to(data.roomId).emit("newMessage", {
        message: data.message,
        senderId: data.senderId,
      });
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};
