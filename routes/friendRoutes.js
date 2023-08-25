const {
  SendFriendRequest,
  SentRequests,
  PendingRequests,
  FindUserByIds,
  SearchUsers,
  HandleFriendRequestAction,
  GetFriends,
  GetRoomId,
} = require("../controllers/FriendController");
const { userVerification } = require("../middlewares/authMiddleware");

module.exports = (app) => {
  app.get("/api/search", userVerification, SearchUsers);
  app.post("/sendFriendRequest", userVerification, SendFriendRequest);
  app.get("/fetchSentRequests", userVerification, SentRequests);
  app.get("/pendingRequests", userVerification, PendingRequests);
  app.post("/getUsersByIds", userVerification, FindUserByIds);
  app.post("/friendRequestAction", userVerification, HandleFriendRequestAction);
  app.get("/getFriends", userVerification, GetFriends);
  app.post("/getRoomId", userVerification, GetRoomId);
};
