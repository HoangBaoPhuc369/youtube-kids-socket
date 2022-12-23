const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

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
  console.log(`User Connected: ${socket.id}`);

  //take userId and socketId from user
  socket.on("addUser", (data) => {
    addUser(data.userId, socket.id);
    io.emit("getUsers", users);
  });

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
    socket.to(data).emit("user_join", `User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.roomAdmin).emit("message_to_admin", data);
    socket.to(data.roomVideo).emit("receive_message", data);
  });

  socket.on("watch_video", (data) => {
    console.log(data);
    socket.broadcast.to(data.room).emit("get_watch_video_activity", data);
  });

  socket.on("search_activity", (data) => {
    console.log(data);
    socket.broadcast.to(data.room).emit("get_search_activity", data);
  });

  socket.on("profile_activity", (data) => {
    console.log(data);
    socket.broadcast.to(data.room).emit("get_profile_activity", data);
  });

  socket.on("block-video", (data) => {
    console.log(data);
    socket.broadcast.to(data.room).emit("get-block-video", data);
  });

  socket.on("clear-block-video", (data) => {
    console.log(data);
    socket.broadcast.to(data.room).emit("get-clear-block-video", data);
  });

  socket.on("block-search", (data) => {
    console.log(data);
    socket.broadcast.to(data.room).emit("get-block-search", data);
  });

  socket.on("allow-search", (data) => {
    console.log(data);
    socket.broadcast.to(data.room).emit("get-allow-search", data);
  });

  socket.on("block-chat", (data) => {
    console.log(data);
    socket.broadcast.to(data.room).emit("get-block-chat", data);
  });

  socket.on("allow-chat", (data) => {
    console.log(data);
    socket.broadcast.to(data.room).emit("get-allow-chat", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

server.listen(8900, () => {
  console.log("SERVER RUNNING");
});
