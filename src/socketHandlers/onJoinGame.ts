import { Server, Socket } from "socket.io";

export const onJoinGame = (socket: Socket, io: Server) => {
  socket.on("joinGame", (name: string) => {
    console.log(`${name} joined the game`);
    io.emit("joinGame", true);
  });
};
