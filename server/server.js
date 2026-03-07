import dotenv from "dotenv";
import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import Board from "./models/Board.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Whiteboard API running...");
});

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

const roomUsers = {};
const socketToRoom = {};

async function getOrCreateBoard(roomId) {
  const board = await Board.findOneAndUpdate(
    { roomId },
    {
      $setOnInsert: {
        roomId,
        elements: [],
        versions: []
      }
    },
    {
      new: true,
      upsert: true
    }
  );

  return board;
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", async ({ roomId, user }) => {
    try {
      socket.join(roomId);
      socketToRoom[socket.id] = roomId;

      if (!roomUsers[roomId]) roomUsers[roomId] = [];

      const alreadyExists = roomUsers[roomId].some(
        (u) => u.socketId === socket.id
      );

      if (!alreadyExists) {
        roomUsers[roomId].push({
          socketId: socket.id,
          userName: user
        });
      }

      const board = await getOrCreateBoard(roomId);

      socket.emit("load-board", board.elements || []);
      socket.emit("versions-update", board.versions || []);

      io.to(roomId).emit(
        "participants-update",
        roomUsers[roomId].map((u) => u.userName)
      );

      socket.to(roomId).emit("user-joined", { user, roomId });
    } catch (error) {
      console.error("join-room error:", error);
    }
  });

  socket.on("save-element", async ({ roomId, element }) => {
    try {
      const board = await getOrCreateBoard(roomId);
      board.elements.push(element);
      await board.save();

      socket.to(roomId).emit("element-added", element);
    } catch (error) {
      console.error("save-element error:", error);
    }
  });

  socket.on("live-drawing", (segment) => {
    socket.to(segment.roomId).emit("live-drawing", segment);
  });

  socket.on("update-board", async ({ roomId, elements }) => {
    try {
      const board = await getOrCreateBoard(roomId);
      board.elements = elements;
      await board.save();

      io.to(roomId).emit("board-updated", elements);
    } catch (error) {
      console.error("update-board error:", error);
    }
  });

  socket.on("clear-board", async ({ roomId }) => {
    try {
      const board = await getOrCreateBoard(roomId);
      board.elements = [];
      await board.save();

      io.to(roomId).emit("clear-board");
    } catch (error) {
      console.error("clear-board error:", error);
    }
  });

  socket.on("save-version", async ({ roomId, elements }) => {
    try {
      const board = await getOrCreateBoard(roomId);

      board.versions.push({
        elements,
        savedAt: new Date()
      });

      await board.save();

      io.to(roomId).emit("versions-update", board.versions);
    } catch (error) {
      console.error("save-version error:", error);
    }
  });

  socket.on("restore-version", async ({ roomId, versionIndex }) => {
    try {
      const board = await getOrCreateBoard(roomId);

      if (!board.versions[versionIndex]) return;

      board.elements = board.versions[versionIndex].elements;
      await board.save();

      io.to(roomId).emit("board-updated", board.elements);
    } catch (error) {
      console.error("restore-version error:", error);
    }
  });

  socket.on("cursor-move", ({ roomId, userName, x, y }) => {
    socket.to(roomId).emit("cursor-move", {
      socketId: socket.id,
      userName,
      x,
      y
    });
  });

  socket.on("disconnect", () => {
    const roomId = socketToRoom[socket.id];

    if (roomId && roomUsers[roomId]) {
      roomUsers[roomId] = roomUsers[roomId].filter(
        (u) => u.socketId !== socket.id
      );

      io.to(roomId).emit(
        "participants-update",
        roomUsers[roomId].map((u) => u.userName)
      );

      io.to(roomId).emit("cursor-remove", socket.id);
    }

    delete socketToRoom[socket.id];
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});