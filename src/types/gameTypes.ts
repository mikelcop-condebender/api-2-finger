export interface Position {
  row: number;
  col: number;
}

export interface Ship {
  size: number;
  positions: Position[];
}

// src/types.ts
export interface Position {
  row: number;
  col: number;
}

export interface Ship {
  size: number;
  positions: Position[];
}

export interface GameState {
  players: { [id: string]: { socketId: string; name: string } };
  boards: { [id: string]: number[][] };
  ships: { [id: string]: Ship[] };
}

// src/types.ts
export interface Position {
  row: number;
  col: number;
}

export interface Ship {
  size: number;
  positions: Position[];
}

export interface Player {
  id: string;
  name: string;
  board: (string | null)[][];
  ships: { [key: string]: { positions: [number, number][] } };
  points: number;
  playAgain: boolean;
}

export interface Game {
  player1: string;
  player2: string;
  currentTurn: string;
}


export const readyPlayers: Record<string, boolean> = {};
