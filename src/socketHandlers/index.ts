import { Server, Socket } from "socket.io";
import { Player, Game } from "../types/types";
import { getGameId, getOpponentId } from "../utils";
import { onSetName } from "./onSetNames";
import { onPlayerReady } from "./onPlayerReady";
import { onJoinGame } from "./onJoinGame";
import { onStartGame } from "./onStartGame";
import { onPlaceShip } from "./onPlaceShip";
import { onMakeMove } from "./onMakeMove";
import { onPlaygame } from "./onPlayAgain";
import { onDisconnect } from "./onDisconnect";

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
    onJoinGame(socket, io);
    onSetName(initializeBoard, players, socket, io);
    onPlayerReady(readyPlayers, socket, io);
    onStartGame(socket, io, games, players);
    onPlaceShip(players, socket);
    onMakeMove(socket, io, games, players, updateGameState);
    onPlaygame(socket, io, players, resetPlayerState);
    onDisconnect(socket, io, players, readyPlayers);
  });
};
