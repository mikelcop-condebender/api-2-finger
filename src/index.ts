import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";

import * as dotenv from "dotenv";

dotenv.config();

// Now you can access the environment variables
const port = process.env.PORT || 3001;
const baseUrl = process.env.BASE_URL || "default_url";
const boxCount = 6;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: baseUrl,
    methods: ["GET", "POST"],
  },
});

interface Player {
  id: string;
  name: string;
  board: (string | null)[][];
  ships: { [key: string]: { positions: [number, number][] } }; // Track ship positions
}

interface Game {
  player1: string;
  player2: string;
}

let players: Record<string, Player> = {};
let games: Record<string, Game> = {};
const readyPlayers: { [key: string]: boolean } = {};

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).send({ status: "UP" });
});

function initializeBoard(): (string | null)[][] {
  return Array.from({ length: boxCount }, () => Array(boxCount).fill(null));
}

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
      players[socket.id] = {
        id: socket.id,
        name,
        board: initializeBoard(),
        ships: {},
      };
    }

    const playerNames = Object.values(players).map((player) => ({
      id: player.id,
      name: player.name,
    }));

    io.emit("updatePlayers", playerNames);
  });

  socket.on("joinGame", (name: string) => {
    console.log(`${name} join the game`);
    io.emit("joinGame", true);
  });

  socket.on("startGame", () => {
    if (Object.keys(players).length === 2) {
      io.emit("gameStart");
      const playerIds = Object.keys(players);
      games["game1"] = { player1: playerIds[0], player2: playerIds[1] }; // Example game ID
    }
  });

  socket.on("placeShip", ({ ship, orientation, row, col, shipLength }) => {
    const player = players[socket.id];
    if (player) {
      const positions: [number, number][] = [];

      for (let i = 0; i < shipLength; i++) {
        if (orientation === "horizontal") {
          player.board[row][col + i] = ship;
          positions.push([row, col + i]);
        } else if (orientation === "vertical") {
          player.board[row + i][col] = ship;
          positions.push([row + i, col]);
        }
      }

      // Store ship positions
      if (!player.ships[ship]) {
        player.ships[ship] = { positions };
      } else {
        player.ships[ship].positions.push(...positions);
      }

      // io.to(socket.id).emit("shipPlaced", {
      //   player,
      //   ship,
      //   orientation,
      //   row,
      //   col,
      // });
    }
  });

  socket.on("makeMove", ({ row, col }) => {
    const player = players[socket.id];
    const opponentId = getOpponentId(socket.id);

    if (player && opponentId && players[opponentId]) {
      const opponentBoard = players[opponentId].board;

      if (row >= 0 && row < boxCount && col >= 0 && col < boxCount) {
        const cell = opponentBoard[row][col];

        let result: "hit" | "miss";

        if (cell && cell !== "miss") {
          result = "hit";
          opponentBoard[row][col] = "miss"; // Mark cell as hit
        } else {
          result = "miss";
        }

        io.to(socket.id).emit("attackResult", {
          row,
          col,
          result,
          target: "player", // Indicates that this player is the attacker
          socketId: socket.id,
          opponentId: opponentId,
        });

        io.to(opponentId).emit("attackResult", {
          row,
          col,
          result,
          target: "opponent", // Indicates that this player is the defender
          socketId: socket.id,
          opponentId: opponentId,
        });

        updateGameState();
      } else {
        console.error("Invalid move coordinates:", { row, col });
      }
    } else {
      console.error("Player or opponent not found:", { player, opponentId });
    }
  });

  function getOpponentId(playerId: string): string | null {
    for (const gameId in games) {
      const game = games[gameId];
      if (game.player1 === playerId) return game.player2;
      if (game.player2 === playerId) return game.player1;
    }
    return null; // No opponent found
  }

  function updateGameState() {
    for (const playerId in players) {
      const player = players[playerId];
      const opponentId = getOpponentId(playerId);
      if (opponentId && players[opponentId]) {
        const opponent = players[opponentId];

        // Check if all ship positions are hit
        let allShipsSunk = true;
        for (const ship in opponent.ships) {
          const positions = opponent.ships[ship].positions;
          const allHit = positions.every(
            ([row, col]) => opponent.board[row][col] === "miss"
          );

          if (!allHit) {
            allShipsSunk = false;
            break;
          }
        }

        if (allShipsSunk) {
          const winnerName = players[playerId].name;
          io.to(playerId).emit("endGame", { winner: winnerName });
          io.to(opponentId).emit("endGame", { winner: winnerName });

          // Optionally, remove the game from `games` and handle game over logic
          const gameId = getGameId(playerId);
          if (gameId !== null) {
            delete games[gameId];
          }
        }
      }
    }
  }

  function getGameId(playerId: string): string | null {
    for (const gameId in games) {
      const game = games[gameId];
      if (game.player1 === playerId || game.player2 === playerId) return gameId;
    }
    return null;
  }

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

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
