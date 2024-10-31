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
