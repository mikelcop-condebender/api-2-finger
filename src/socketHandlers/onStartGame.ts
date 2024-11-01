import { Server, Socket } from "socket.io";
import { emitTurnStatus } from "../utils";
import { Player } from "../types/gameTypes";

export const onStartGame = (
  socket: Socket,
  io: Server,
  games: Record<string, any>,
  players: Record<string, Player> = {}
) => {
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
};
