const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./db.js");
const cors = require("cors");
const errorHandler = require("./middleware/error");
const colors = require("colors");
const auth = require("./routes/Auth");
const Restaurant = require("./routes/Restaurants");
const MenuData = require("./routes/MenuData");
const Reviews = require("./routes/Review");
const Conversation = require("./routes/Conversation");
const Message = require("./routes/Messages");
const Order = require("./routes/Order");
const User = require("./routes/User");
const Saloon = require("./routes/Saloon");

dotenv.config({ path: "./config/config.env" });

connectDB();
const app = express();
//socket io http server

const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
//use json formate data
app.use(express.json());
//enable cors
app.use(cors());

const Port = process.env.PORT || 5000;

app.use("/api/v1/auth", auth);
app.use("/api/v1/user", User);
app.use("/api/v1/res", Restaurant);
app.use("/api/v1/saloon", Saloon);

app.use("/api/v1/menu", MenuData);
app.use("/api/v1/review", Reviews);
app.use("/api/v1/messages", Message);
app.use("/api/v1/order", Order);
app.use("/api/v1/conversation", Conversation);

app.use(errorHandler);
//socket IO Chat
let users = [];

const addUser = (userId, socketId) => {
  if (!users.some((user) => user.userId === userId)) {
    users.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  if (!users) {
    return;
  }
  return users.find((user) => user.userId == userId);
};

io.on("connection", (socket) => {
  //when ceonnect
  console.log("a user connected.");
  socket.emit("message", "welcome");
  socket.on("Welcome", (msg) => {
    io.broadcast();
  });

  socket.on("Chat", (msg) => {
    io.emit("message", msg);
  });

  //take userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
    console.log(users);
  });

  //send and get message
  socket.on("sendMessage", ({ senderId, recieverId, text }) => {
    console.log("reciever id", recieverId);
    const userR = getUser(recieverId);
    if (!userR) {
      return;
    }
    console.log("user", userR.socketId);
    io.to(userR.socketId).emit("getMessage", {
      senderId,
      text,
    });
  });

  //For Updating Status of Order
  socket.on("changeOrderStatus", ({ senderId, recieverId, text }) => {
    console.log("recieved id", recieverId);
    //console.log("user", user);
    const user = getUser(recieverId);
    if (!user) {
      return;
    }
    io.to(user.socketId).emit("getOrderStatus", {
      senderId,
      text,
    });
  });

  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", users);
    io.emit("SendData");
  });
});

server.listen(Port, () => {
  console.log(`Example app listening on port ${Port}`.magenta);
});
