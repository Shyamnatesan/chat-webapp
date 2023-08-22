const {
  Signup,
  Login,
  verifyToken,
  SearchUsers,
} = require("../controllers/Authcontroller");
const { userVerification } = require("../middlewares/authMiddleware");

module.exports = (app) => {
  app.post("/auth/signup", Signup);
  app.post("/auth/verifyToken", userVerification, verifyToken);
  app.post("/auth/login", Login);
  app.post("/", userVerification);
  app.get("/api/search", userVerification, SearchUsers);
};
