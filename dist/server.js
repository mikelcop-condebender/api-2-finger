"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
const PORT = 4000;
let gameState = {
  players: {},
  boards: {},
  ships: {},
};
io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  socket.on("joinGame", (playerId) => {
    console.log("JOIN GAME");
    gameState.players[playerId] = { socketId: socket.id };
    gameState.boards[playerId] = Array(10).fill(Array(10).fill(0));
    gameState.ships[playerId] = [];
    // Notify client that player has joined
    socket.emit("playerJoined");
    // Optionally, broadcast the current game state
    // socket.emit("updateBoard");
  });
  socket.on("placeShip", ({ playerId, ship }) => {
    console.log("is this called", { playerId });
    const board = gameState.boards[playerId];
    const ships = gameState.ships[playerId];
    const isValid = validateShipPlacement(board, ship);
    console.log({ isValid });
    if (isValid) {
      placeShipOnBoard(board, ship);
      ships.push(ship);
      socket.emit("updateBoard", {
        [playerId]: gameState.boards[playerId],
      });
      console.log("SERVER UPDATE BOARD!!!!!", playerId, ships);
    } else {
      socket.emit("placementError", "Invalid ship placement.");
    }
  });
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    for (const [id, player] of Object.entries(gameState.players)) {
      if (player.socketId === socket.id) {
        delete gameState.players[id];
        delete gameState.boards[id];
        delete gameState.ships[id];
        break;
      }
    }
  });
});
const isValidShipPlacement = (board, ship) => {
  const { positions } = ship;
  if (positions.length === 0) return false;
  // Determine if all positions are in a single row or column
  const rows = new Set(positions.map((pos) => pos.row));
  const cols = new Set(positions.map((pos) => pos.col));
  // Check if ship is placed in a straight line
  const isHorizontal = rows.size === 1; // All positions have the same row
  const isVertical = cols.size === 1; // All positions have the same column
  // Ensure all positions are within board boundaries
  const isInBounds = positions.every(
    ({ row, col }) =>
      row >= 0 && row < board.length && col >= 0 && col < board[0].length
  );
  return (isHorizontal || isVertical) && isInBounds;
};
const doesShipOverlap = (board, ship) => {
  return ship.positions.some(({ row, col }) => board[row][col] === 1);
};
const validateShipPlacement = (board, ship) => {
  // Validate boundaries and alignment
  if (!isValidShipPlacement(board, ship)) {
    return false;
  }
  // Validate overlap
  if (doesShipOverlap(board, ship)) {
    return false;
  }
  return true;
};
const placeShipOnBoard = (board, ship) => {
  // Create a deep copy of the board
  const newBoard = board.map((row) => [...row]);
  // Place the ship on the new board
  ship.positions.forEach(({ row, col }) => {
    if (newBoard[row] && newBoard[row][col] !== undefined) {
      newBoard[row][col] = 1; // Mark the ship's positions on the board
    }
  });
  return newBoard;
};
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
