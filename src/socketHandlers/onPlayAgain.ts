import { Server, Socket } from "socket.io";
import { emitTurnStatus } from "../utils";
import { Player } from "../types/gameTypes";

/**
 * @description This function handles the play again event
 * @param socket The socket instance
 * @param io The socket.io server instance
 * @param players The players object
 * @param resetPlayerState The function to reset the player state
 */
export const onPlaygame = (
  socket: Socket,
  io: Server,
  players: Record<string, Player> = {},
  resetPlayerState: (id: string) => void
) => {
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
};
