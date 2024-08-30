"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});
const PORT = 4000;
let gameState = {
    players: {},
    boards: {},
    ships: {},
};
io.on("connection", (socket) => {
    console.log("A user connected", socket.id);
    socket.on("joinGame", (playerId) => {
        if (!gameState.players[playerId]) {
            gameState.players[playerId] = {
                socketId: socket.id,
                name: `Player ${playerId}`,
            }; // Example name assignment
            gameState.boards[playerId] = Array(10).fill(Array(10).fill(0));
            gameState.ships[playerId] = [];
            // Check if another player is already in the game
            const otherPlayerId = Object.keys(gameState.players).find((id) => id !== playerId);
            if (otherPlayerId) {
                const player1Name = gameState.players[playerId].name;
                const player2Name = gameState.players[otherPlayerId].name;
                // Notify both players that the game is ready
                io.to(gameState.players[playerId].socketId).emit("gameReady", {
                    playerId,
                    player2Id: otherPlayerId,
                    player1Name,
                    player2Name,
                    boards: gameState.boards,
                });
                io.to(gameState.players[otherPlayerId].socketId).emit("gameReady", {
                    playerId,
                    player2Id: otherPlayerId,
                    player1Name,
                    player2Name,
                    boards: gameState.boards,
                });
            }
            else {
                // Notify the single player that they've joined successfully
                socket.emit("playerJoined");
            }
        }
    });
    socket.on("placeShip", ({ playerId, ship, isPlayerShip, }) => {
        if (!playerId || !ship || !ship.positions)
            return;
        const board = gameState.boards[playerId];
        const ships = gameState.ships[playerId];
        if (!board)
            return;
        const isValid = validateShipPlacement(board, ship);
        if (isValid) {
            if (isPlayerShip) {
                placeShipOnBoard(board, ship);
                ships.push(ship);
            }
            else {
                // Handle enemy ship placement if necessary
            }
            io.emit("updateBoard", {
                [playerId]: {
                    playerBoard: gameState.boards[playerId],
                    enemyBoard: gameState.boards[playerId], // Adjust for enemy board if necessary
                },
            });
        }
        else {
            socket.emit("placementError", "Invalid ship placement.");
        }
    });
    socket.on("disconnect", () => {
        console.log("user disconnected", socket.id);
        for (const [id, player] of Object.entries(gameState.players)) {
            if (player.socketId === socket.id) {
                delete gameState.players[id];
                delete gameState.boards[id];
                delete gameState.ships[id];
                break;
            }
        }
        // Notify remaining player if one disconnects
        if (Object.keys(gameState.players).length === 1) {
            const remainingPlayerId = Object.keys(gameState.players)[0];
            io.to(gameState.players[remainingPlayerId].socketId).emit("opponentDisconnected");
        }
    });
});
const createEmptyBoard = (size) => {
    return Array.from({ length: size }, () => Array(size).fill(0));
};
const isValidShipPlacement = (board, ship) => {
    if (!ship.positions || ship.positions.length === 0)
        return false;
    const { positions } = ship;
    const rows = new Set(positions.map((pos) => pos.row));
    const cols = new Set(positions.map((pos) => pos.col));
    const isHorizontal = rows.size === 1;
    const isVertical = cols.size === 1;
    const isInBounds = positions.every(({ row, col }) => row >= 0 && row < board.length && col >= 0 && col < board[0].length);
    return (isHorizontal || isVertical) && isInBounds;
};
const doesShipOverlap = (board, ship) => {
    if (!ship.positions)
        return false;
    return ship.positions.some(({ row, col }) => board[row][col] === 1);
};
const validateShipPlacement = (board, ship) => {
    const isOk = isValidShipPlacement(board, ship);
    if (!isOk)
        return false;
    if (doesShipOverlap(board, ship))
        return false;
    return true;
};
const placeShipOnBoard = (board, ship) => {
    if (!ship.positions)
        return;
    ship.positions.forEach(({ row, col }) => {
        if (board[row] && board[row][col] !== undefined) {
            board[row][col] = 1;
        }
    });
};
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
