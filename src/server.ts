import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

interface Player {
  id: string;
  board: string[][];
}

let players: Record<string, Player> = {};
let games: Record<string, any> = {};

io.on("connection", (socket: Socket) => {
  console.log("a user connected:", socket.id);

  socket.on("startGame", () => {
    players[socket.id] = { id: socket.id, board: initializeBoard() };
    if (Object.keys(players).length === 2) {
      io.emit("gameStart");
    }
  });

  socket.on(
    "placeShip",
    (data: { ship: string; orientation: string; row: number; col: number }) => {
      // Handle ship placement
    }
  );

  socket.on("makeMove", (data: { row: number; col: number }) => {
    // Handle making a move
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    delete players[socket.id];
  });
});

function initializeBoard(): string[][] {
  return Array(10).fill(Array(10).fill(null));
}

server.listen(3001, () => {
  console.log("listening on *:3001");
});
