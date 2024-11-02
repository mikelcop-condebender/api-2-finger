// utils.ts

import { Server } from "socket.io";
import { Game, Player } from "./types/gameTypes";

export const getGameId = (
  games: Record<string, Game> = {},
  playerId: string
): string | null => {
  return (
    Object.keys(games).find(
      (gameId) =>
        games[gameId].player1 === playerId || games[gameId].player2 === playerId
    ) || null
  );
};

export const getOpponentId = (
  games: Record<string, Game> = {},
  playerId: string
): string | null => {
  const gameId = getGameId(games, playerId);
  if (!gameId) return null;
  const game = games[gameId];
  return game.player1 === playerId ? game.player2 : game.player1;
};

export const emitTurnStatus = (
  currentPlayer: string,
  opponent: string,
  io: Server
) => {
  io.to(currentPlayer).emit("yourTurn", { isYourTurn: true });
  io.to(opponent).emit("yourTurn", { isYourTurn: false });
};

export const getPlayerWithHighestPoints = (
  players: Record<string, Player>
): Player | null => {
  return Object.values(players).reduce((highestPlayer, player) => {
    return player.points > (highestPlayer?.points || 0)
      ? player
      : highestPlayer;
  }, null as Player | null);
};
