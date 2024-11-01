import { Server, Socket } from "socket.io";
import { Player } from "../types/gameTypes";

export const onPlaceShip = (
  players: Record<string, Player> = {},
  socket: Socket
) => {
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
};
