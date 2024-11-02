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
  resetPlayerState: (id: string) => void,
  games: Record<string, any>
) => {
  socket.on("playAgain", (isWinner: boolean) => {
    if (players[socket.id]) {
      players[socket.id].playAgain = true;
      const allReady = Object.keys(players).every(
        (id) => players[id].playAgain
      );

      if (allReady) {
        const playerIds = Object.keys(players);
        Object.keys(players).forEach(resetPlayerState);

        games["game1"] = {
          player1: playerIds[0],
          player2: playerIds[1],
          currentTurn: playerIds[0],
        };
        io.emit("gameRestarted", {
          message: "The game is restarting. Get ready!",
        });
        console.log("Game restarted", players);
        emitTurnStatus(playerIds[0], playerIds[1], io);
        io.emit(
          "updatePlayers",
          Object.values(players).map(({ id, name, points }) => ({
            id,
            name,
            points,
          }))
        );
        io.emit("gameStart");
      }
    }
  });
};
