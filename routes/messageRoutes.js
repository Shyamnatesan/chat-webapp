const { GetMessagesByRoomId } = require("../controllers/MessageController");
const { userVerification } = require("../middlewares/authMiddleware");

module.exports = (app) => {
  app.get("/getMessages/:roomId", userVerification, GetMessagesByRoomId);
};
