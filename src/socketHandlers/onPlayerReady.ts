import { Server, Socket } from "socket.io";

export const onPlayerReady = (
  readyPlayers: Record<string, boolean> = {},
  socket: Socket,
  io: Server
) => {
  socket.on("playerReady", () => {
    readyPlayers[socket.id] = true;
    if (Object.keys(readyPlayers).length === 2) io.emit("startGame");
  });
};
