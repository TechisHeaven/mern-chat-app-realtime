const express = require("express");
const app = express();
const { chats } = require("./data/data");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoute");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoute");
const ConnectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");
const PORT = process.env.PORT || 5000;
dotenv.config();
ConnectDB();

app.use(express.json());



app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);



// Deployment---------------------------
const __dirname1 = path.resolve();

if(process.env.NODE_ENV === 'production'){
  app.use(express.static(path.join(__dirname1, '/frontend/build')))


  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"));
  })
}
else{
  app.get("/", (req, res) => {
    res.send("API is running");
  });
}




// Deployment---------------------------





app.use(notFound);
app.use(errorHandler);

app.get("/api/chat", (req, res) => {
  res.send(chats);
});

app.get("/api/chat/:id", (req, res) => {
  let singleChat = chats.find((e) => e._id === req.params.id);
  res.send(singleChat);
});

const server = app.listen(PORT || 5000, () =>
  console.log(`Listening on port ${PORT}`.yellow.bold)
);

// const io = new WebSocket("ws://mern-chat-app-p6sj.onrender.com");
// here fix may be

const io = require("socket.io")(server, {
  pingTimout: 60000,
  cors: {
    // origin: "https://mern-chat-app-p6sj.onrender.com",
    origin: "https://localhost:5000",
  },
});

io.on("connection", (socket) => {
  console.log("Connection to Socket io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
  });
  
  socket.on("typing", (room)=>{
    socket.to(room).emit("typing");
  })
  socket.on("stoptyping", (room)=>{
    socket.to(room).emit("stoptyping");
  })

  socket.on("newMessage", (newMessageRecieved) => {
    let chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;
      socket.to(user._id).emit("message recieved", newMessageRecieved);
    });
  });


  socket.offAny("setup", () => {
    console.log("USER DISCONNECTED")
    socket.leave(userData._id)
  });

});
