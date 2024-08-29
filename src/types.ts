export interface Player {
  socketId: string;
}

export interface GameState {
  players: { [playerId: string]: Player };
  boards: { [playerId: string]: number[][] }; // Board state for each player
  ships: { [playerId: string]: Ship[] }; // Ships for each player
}

export interface Position {
  row: number;
  col: number;
}

export interface Ship {
  size: number;
  positions: Position[];
}

export interface GameState {
  players: { [playerId: string]: Player };
  boards: { [playerId: string]: number[][] };
  ships: { [playerId: string]: Ship[] };
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
  players: { [playerId: string]: Player };
  boards: { [playerId: string]: number[][] };
  ships: { [playerId: string]: Ship[] };
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
