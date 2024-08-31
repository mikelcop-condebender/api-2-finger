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
let players = {};
let games = {};
io.on("connection", (socket) => {
    console.log("a user connected:", socket.id);
    socket.on("startGame", () => {
        players[socket.id] = { id: socket.id, board: initializeBoard() };
        if (Object.keys(players).length === 2) {
            io.emit("gameStart");
        }
    });
    socket.on("placeShip", (data) => {
        // Handle ship placement
    });
    socket.on("makeMove", (data) => {
        // Handle making a move
    });
    socket.on("disconnect", () => {
        console.log("user disconnected");
        delete players[socket.id];
    });
});
function initializeBoard() {
    return Array(10).fill(Array(10).fill(null));
}
server.listen(3001, () => {
    console.log("listening on *:3001");
});
