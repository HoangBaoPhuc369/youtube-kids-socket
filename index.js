const express = require("express");
const socket = require("socket.io");
const PORT = 8900;

const app = express();

const server = app.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

const io = socket(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let users = [];

const addUser = (userId, socketId, userName, picture, timeJoin) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId, userName, picture, timeJoin });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  //when connect
  console.log("a user connected.");

  //take userId and socketId from user
  socket.on("addUser", (data) => {
    addUser(data.userId, socket.id);
    io.emit("getUsers", users);
  });

  //send and get message
  socket.on("sendMessage", ({ messages, currentChatID }) => {
    const user = getUser(messages?.receiver);
    io.to(user?.socketId).emit("getMessage", { messages, currentChatID });
  });

  //get and sent message delivered
  socket.on("messageDelivered", (data) => {
    const user = getUser(data.message?.sender);
    io.to(user?.socketId).emit("getMessageDelivered", data);
  });

  //get and sent message seen
  socket.on("messageSeen", (data) => {
    const user = getUser(data.message?.sender);
    io.to(user?.socketId).emit("getMessageSeen", data);
  });

  //get and sent message seen all
  socket.on("messageSeenAll", (data) => {
    const user = getUser(data.receiverId);
    io.to(user?.socketId).emit("getMessageSeenAll", data);
  });

  // Listen typing events
  socket.on("start typing message", (data) => {
    console.log("start typing message", data);
    const user = getUser(data.receiverId);
    io.to(user?.socketId).emit("start typing message", data);
  });
  socket.on("stop typing message", (data) => {
    const user = getUser(data.receiverId);
    io.to(user?.socketId).emit("stop typing message", data);
  });

  //when disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });

});
