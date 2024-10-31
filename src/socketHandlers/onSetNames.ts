import { Server, Socket } from "socket.io";
import { Player } from "../types/types";

export const onSetName = (
  initializeBoard: () => (string | null)[][],
  players: Record<string, Player> = {},
  socket: Socket,
  io: Server
) => {
  socket.on("setName", (name: string) => {
    if (!players[socket.id]) {
      players[socket.id] = {
        id: socket.id,
        name,
        board: initializeBoard(),
        ships: {},
        points: 0,
        playAgain: false,
      };
    } else {
      players[socket.id].name = name;
    }

    io.emit(
      "updatePlayers",
      Object.values(players).map(({ id, name }) => ({ id, name }))
    );
  });
};
