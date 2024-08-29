import express from "express";
import http from "http";
import { Server } from "socket.io";
import { GameState, Ship, Position } from "./types";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const PORT = 4000;

let gameState: GameState = {
  players: {},
  boards: {},
  ships: {},
};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  socket.on("joinGame", (playerId: string) => {
    gameState.players[playerId] = { socketId: socket.id };

    // Initialize board with separate row arrays
    gameState.boards[playerId] = Array.from({ length: 10 }, () =>
      Array(10).fill(0)
    );
    gameState.ships[playerId] = [];

    // Notify client that player has joined
    socket.emit("playerJoined");

    // Optionally, broadcast the current game state
    // socket.emit("updateBoard");
  });

  socket.on(
    "placeShip",
    ({ playerId, ship }: { playerId: string; ship: Ship }) => {
      const board = gameState.boards[playerId];
      const ships = gameState.ships[playerId];

      const isValid = validateShipPlacement(board, ship);

      console.log("IS VALID", isValid);

      if (isValid) {
        placeShipOnBoard(board, ship);
        ships.push(ship);
        io.emit("updateBoard", { [playerId]: gameState.boards[playerId] }); // Notify all clients
      } else {
        socket.emit("placementError", "Invalid ship placement.");
      }
    }
  );

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
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

const isValidShipPlacement = (board: number[][], ship: Ship): boolean => {
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

const doesShipOverlap = (board: number[][], ship: Ship): boolean => {
  console.log({ board, ship });
  const isTrue = ship.positions.some(({ row, col }) => board[row][col] === 1);
  console.log({ isTrue, board }, ship.positions);
  return isTrue;
};

const validateShipPlacement = (board: number[][], ship: Ship): boolean => {
  // Validate boundaries and alignment
  const isOk = isValidShipPlacement(board, ship);
  console.log("KKKKK", isOk);
  if (!isOk) {
    return false;
  }

  // Validate overlap
  if (doesShipOverlap(board, ship)) {
    return false;
  }

  return true;
};

const placeShipOnBoard = (board: number[][], ship: Ship): void => {
  // Place the ship on the board directly
  ship.positions.forEach(({ row, col }) => {
    if (board[row] && board[row][col] !== undefined) {
      board[row][col] = 1; // Mark the ship's positions on the board
    }
  });
};

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
