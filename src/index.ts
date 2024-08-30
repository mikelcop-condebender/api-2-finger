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
  name: string;
  board: (string | null)[][];
}

let players: Record<string, Player> = {};
let games: Record<string, any> = {};
const readyPlayers: { [key: string]: boolean } = {};

io.on("connection", (socket: Socket) => {
  console.log("a user connected:", socket.id);

  socket.on("playerReady", () => {
    readyPlayers[socket.id] = true;
    if (Object.keys(readyPlayers).length === 2) {
      io.emit("startGame");
    }
  });

  socket.on("setName", (name: string) => {
    if (players[socket.id]) {
      players[socket.id].name = name;
    } else {
      players[socket.id] = { id: socket.id, name, board: initializeBoard() };
    }

    console.log("SERVER SETNAME", name, { players });

    const playerNames = Object.values(players).map((player) => ({
      id: player.id,
      name: player.name,
    }));

    console.log({ playerNames });

    io.emit("updatePlayers", playerNames);
  });

  socket.on("startGame", () => {
    console.log("PLAYERS", Object.keys(players).length, players);
    if (Object.keys(players).length === 2) {
      io.emit("gameStart");
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    delete players[socket.id];
    delete readyPlayers[socket.id]; // Clear the player's ready status on disconnect
    io.emit(
      "updatePlayers",
      Object.values(players).map((player) => ({
        id: player.id,
        name: player.name,
      }))
    );
  });
});

function initializeBoard(): (string | null)[][] {
  return Array.from({ length: 10 }, () => Array(10).fill(null));
}

server.listen(3001, () => {
  console.log("listening on *:3001");
});
