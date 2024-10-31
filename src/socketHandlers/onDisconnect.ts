import { Server, Socket } from "socket.io";
import { Player } from "../types/types";

/**
 * Handles the disconnection of a player from the game.
 * @param socket - The socket instance of the player.
 * @param io - The Socket.IO server instance.
 * @param players - The object containing all connected players.
 * @param readyPlayers - The object containing all players who are ready.
 */
export const onDisconnect = (
  socket: Socket,
  io: Server,
  players: Record<string, Player> = {},
  readyPlayers: Record<string, boolean> = {}
) => {
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete players[socket.id];
    delete readyPlayers[socket.id];
    io.emit(
      "updatePlayers",
      Object.values(players).map(({ id, name }) => ({ id, name }))
    );
  });
};
