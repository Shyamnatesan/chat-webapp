// index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketSetup = require("./socket");
const app = express();
require("dotenv").config();

const { MONGO_URL, PORT } = process.env;

mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB is connected successfully"))
  .catch((err) => console.error(err));

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

require("./routes/authRoutes")(app);
require("./routes/friendRoutes")(app);
require("./routes/messageRoutes")(app);
const server = http.createServer(app);
const io = socketSetup(server);
require("./controllers/ChatController")(io);

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
