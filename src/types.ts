export interface Player {
  socketId: string;
}

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
