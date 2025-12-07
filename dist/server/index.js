"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const gameState_1 = require("./gameState");
const analytics_1 = require("./analytics");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*", // Allow dev client
        methods: ["GET", "POST"]
    }
});
const PORT = process.env.PORT || 3001;
const gameState = new gameState_1.GameState((from, to) => {
    io.emit('tagTransfer', { from, to });
});
// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    const clientDist = path_1.default.join(__dirname, '../client'); // Assumes dist/server/index.js and dist/client
    app.use(express_1.default.static(clientDist));
    app.get('/*', (req, res) => {
        res.sendFile(path_1.default.join(clientDist, 'index.html'));
    });
}
io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);
    const player = gameState.addPlayer(socket.id);
    // Send initial state
    socket.emit('init', {
        id: socket.id,
        players: Array.from(gameState.players.values())
    });
    analytics_1.analytics.track('session_start', socket.id);
    // Broadcast new player
    socket.broadcast.emit('playerJoined', player);
    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        gameState.removePlayer(socket.id);
        io.emit('playerLeft', socket.id);
        analytics_1.analytics.track('session_end', socket.id);
    });
    socket.on('move', (pos) => {
        // Basic validation
        if (typeof pos.x === 'number' && typeof pos.y === 'number') {
            gameState.movePlayer(socket.id, pos.x, pos.y);
            socket.broadcast.emit('playerMoved', { id: socket.id, position: pos });
        }
    });
    socket.on('chat', (emoji) => {
        if (typeof emoji === 'string' && emoji.length < 10) { // Limit length
            gameState.handleChat(socket.id, emoji);
            io.emit('playerChat', { id: socket.id, emoji });
        }
    });
});
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
