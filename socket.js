// socketSetup.js
const socketIo = require("socket.io");
const Messages = require("./models/Messages");

module.exports = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on("sendMessage", async (data) => {
      console.log("Message received:", data);

      // Store the message in the database
      const newMessage = new Messages({
        roomId: data.roomId, // Store the roomId
        senderId: socket.id,
        recipientId: data.recipientId,
        content: data.message,
      });

      await newMessage.save();

      // Send the message to the room of the recipient
      io.to(data.roomId).emit("newMessage", {
        message: data.message,
        senderId: socket.id,
      });
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};
