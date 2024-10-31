import express from "express";
import http from "http";
import { Server } from "socket.io";
import notesRouter from "./notes"; // Path may need adjustment
import { Game, Player } from "./types/types";
import { baseUrl, boxCount, port } from "./config";
import { setupSocketHandlers } from "./socketHandlers";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: baseUrl,
    methods: ["GET", "POST"],
  },
});

// Game State
let players: Record<string, Player> = {};
let games: Record<string, Game> = {};
const readyPlayers: Record<string, boolean> = {};

// Initialize Board Function
const initializeBoard = (): (string | null)[][] =>
  Array.from({ length: boxCount }, () => Array(boxCount).fill(null));

// Express Routes
app.get("/health", (_, res) => res.status(200).send({ status: "UP" }));
app.use(notesRouter);

setupSocketHandlers(games, players, initializeBoard, readyPlayers, io);

server.listen(port, () => console.log(`Listening on *:${port}`));
