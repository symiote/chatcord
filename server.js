const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatmessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users.js");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
// set static folder
app.use(express.static(path.join(__dirname, "public")));

const botName = "chatCord Bot!";

// run when client connects it
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    //join room
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    //welcome current user
    socket.emit("message", formatmessage(botName, "Welcome to chatCORD!"));

    //broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatmessage(botName, `${user.username} | has joined the chat`)
      );

    //send user and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  //listen for chatmsg
  socket.on("chatMessage", (msg) => {
    const currentuser = getCurrentUser(socket.id);
    io.to(currentuser.room).emit(
      "message",
      formatmessage(currentuser.username, msg)
    );
  });

  //runs when client dissconect
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatmessage(botName, `${user.username} | has left the chat`) 
      );
    // Update room users only if user exists
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  
    }
 });
});


//server setup 
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("se rver runnning at port : " + PORT);
});
