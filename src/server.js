require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const passport = require('passport');
const session = require('express-session');
const http = require('http'); 
const { Server } = require('socket.io'); 
const messageRoutes = require('./routes/message.routes');

require('./config/passport'); 

const app = express();
const server = http.createServer(app); 

const allowedOrigins = [
  "http://localhost:5173", 
  "http://localhost:5174",
  "https://00shamima.github.io",
  "https://innovationc-coach.onrender.com" 
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

const uploadsPath = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.JWT_SECRET || 'innovation_coach_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', 
    maxAge: 24 * 60 * 60 * 1000 
  } 
}));

app.use(passport.initialize()); 
app.use(passport.session()); 

app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*'); 
  }
}));

app.get('/', (req, res) => {
  res.status(200).json({ message: "Innovation Coach Backend is Live!" });
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/posts', require('./routes/post.routes'));
app.use('/api/likes', require('./routes/like.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/messages', messageRoutes);

let onlineUsers = [];
io.on("connection", (socket) => {
  socket.on("addNewUser", (userId) => {
    if (userId && !onlineUsers.some(u => u.userId === userId)) {
      onlineUsers.push({ userId, socketId: socket.id });
    }
    io.emit("getOnlineUsers", onlineUsers);
  });

  socket.on("sendMessage", (message) => {
    const user = onlineUsers.find(u => u.userId === message.receiverId);
    if (user) {
      io.to(user.socketId).emit("getMessage", message);
    }
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter(u => u.socketId !== socket.id);
    io.emit("getOnlineUsers", onlineUsers);
  });
});

app.use((err, req, res, next) => {
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});