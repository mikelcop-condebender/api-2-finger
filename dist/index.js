"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const notes_1 = __importDefault(require("./notes")); // Path may need adjustment
const config_1 = require("./config");
const socketHandlers_1 = require("./socketHandlers");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: config_1.baseUrl,
        methods: ["GET", "POST"],
    },
});
// Game State
let players = {};
let games = {};
const readyPlayers = {};
// Initialize Board Function
const initializeBoard = () => Array.from({ length: config_1.boxCount }, () => Array(config_1.boxCount).fill(null));
// Express Routes
app.get("/health", (_, res) => res.status(200).send({ status: "UP" }));
app.use(notes_1.default);
(0, socketHandlers_1.setupSocketHandlers)(games, players, initializeBoard, readyPlayers, io);
server.listen(config_1.port, () => console.log(`Listening on *:${config_1.port}`));
