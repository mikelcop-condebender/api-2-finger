import { Server, Socket } from "socket.io";
import { Player } from "../types/types";
import { emitTurnStatus, getGameId, getOpponentId } from "../utils";
import { boxCount } from "../config";

export const onMakeMove = (
  socket: Socket,
  io: Server,
  games: Record<string, any>,
  players: Record<string, Player> = {},
  updateGameState: () => void
) => {
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
};
