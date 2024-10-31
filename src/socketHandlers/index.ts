// socketHandlers.ts
import { Server, Socket } from "socket.io";
import { Player, Game } from "../types/types";
import { emitTurnStatus, getGameId, getOpponentId } from "../utils";
import { boxCount } from "../config";
import { onSetName } from "./onSetNames";
import { onPlayerReady } from "./onPlayerReady";

export const setupSocketHandlers = (
  games: Record<string, Game> = {},
  players: Record<string, Player> = {},
  initializeBoard: () => (string | null)[][],
  readyPlayers: Record<string, boolean> = {},
  io: Server
) => {
  const resetPlayerState = (playerId: string) => {
    const player = players[playerId];
    if (player) {
      Object.assign(player, {
        board: initializeBoard(),
        ships: {},
        points: 0,
        playAgain: false,
      });
      delete readyPlayers[playerId];
    }
  };

  const updateGameState = () => {
    Object.entries(players).forEach(([playerId, player]) => {
      const opponentId = getOpponentId(games, playerId);
      if (!opponentId) return;
      const opponent = players[opponentId];

      const allShipsSunk = Object.values(opponent.ships).every((ship) =>
        ship.positions.every(
          ([row, col]) => opponent.board[row][col] === "miss"
        )
      );

      if (allShipsSunk) {
        io.to(playerId).emit("endGame", playerId);
        io.to(opponentId).emit("endGame", playerId);
        io.emit("askPlayAgain", { message: "Do you want to play again?" });
        delete games[getGameId(games, playerId) as any];
      }
    });
  };

  // Socket.IO Event Handlers
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    onPlayerReady(readyPlayers, socket, io);

    onSetName(initializeBoard, players, socket, io);

    socket.on("joinGame", (name: string) => {
      console.log(`${name} joined the game`);
      io.emit("joinGame", true);
    });

    socket.on("startGame", () => {
      const playerIds = Object.keys(players);
      if (playerIds.length === 2) {
        games["game1"] = {
          player1: playerIds[0],
          player2: playerIds[1],
          currentTurn: playerIds[0],
        };
        emitTurnStatus(playerIds[0], playerIds[1], io);
        io.emit("gameStart");
      }
    });

    socket.on("placeShip", ({ ship, orientation, row, col, shipLength }) => {
      const player = players[socket.id];
      if (!player) return;

      const positions: [number, number][] = [];
      for (let i = 0; i < shipLength; i++) {
        if (orientation === "horizontal") {
          player.board[row][col + i] = ship;
          positions.push([row, col + i]);
        } else {
          player.board[row + i][col] = ship;
          positions.push([row + i, col]);
        }
      }
      player.ships[ship] = {
        positions: [...(player.ships[ship]?.positions || []), ...positions],
      };
    });

    socket.on("makeMove", ({ row, col }) => {
      const player = players[socket.id];
      const gameId = getGameId(games, socket.id);
      if (!gameId || !player) return;

      const game = games[gameId];
      const opponentId = getOpponentId(games, socket.id);
      const opponent = players[opponentId || ""];

      if (
        game.currentTurn === socket.id &&
        opponent &&
        row >= 0 &&
        row < boxCount &&
        col >= 0 &&
        col < boxCount
      ) {
        const cell = opponent.board[row][col];
        const result = cell && cell !== "miss" ? "hit" : "miss";
        if (result === "hit") {
          opponent.board[row][col] = "miss";
          player.points += 1;
        }
        const update = {
          row,
          col,
          result,
          points: player.points,
        };
        io.to(socket.id).emit("attackResult", { ...update, target: "player" });
        io.to(opponentId as any).emit("attackResult", {
          ...update,
          target: "opponent",
        });

        if (result === "miss") {
          game.currentTurn = opponentId as any;
          emitTurnStatus(opponentId as any, socket.id, io);
        } else {
          io.to(socket.id).emit("yourTurn", { isYourTurn: true });
        }

        io.emit(
          "updatePlayers",
          Object.values(players).map(({ id, name, points }) => ({
            id,
            name,
            points,
          }))
        );
        updateGameState();
      }
    });

    socket.on("playAgain", () => {
      if (players[socket.id]) {
        players[socket.id].playAgain = true;
        const allReady = Object.keys(players).every(
          (id) => players[id].playAgain
        );
        if (allReady) {
          Object.keys(players).forEach(resetPlayerState);
          io.emit("gameRestarted", {
            message: "The game is restarting. Get ready!",
          });
          io.emit("gameStart");
          emitTurnStatus(Object.keys(players)[0], Object.keys(players)[1], io);
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      delete players[socket.id];
      delete readyPlayers[socket.id];
      io.emit(
        "updatePlayers",
        Object.values(players).map(({ id, name }) => ({ id, name }))
      );
    });
  });
};
