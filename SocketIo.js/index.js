const express = require("express");
const { Server } = require("socket.io");

const cors = require("cors");

const colors = require("colors");

const app = express();
//socket io http server
app.use(cors());
const server = require("http").createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
//use json formate data
app.use(express.json());
//enable cors
app.use(cors());

const Port = 3000;

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  //when ceonnect
  console.log("a user connected.".white);
  socket.emit("message", "Welcome");

  socket.on("Chat", (msg) => {
    io.emit("message", msg);
  });
  //take userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  //send and get message
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    io.to(user.socketId).emit("getMessage", {
      senderId,
      text,
    });
  });

  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

app.get("/", (req, res) => {
  res.send({ name: "Hello word" });
});
server.listen(Port, () => {
  console.log(`Example app listening on port ${Port}`.magenta);
});
