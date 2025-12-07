import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import path from 'path';
import { GameState } from './gameState';
import { analytics } from './analytics';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allow dev client
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3001;
const gameState = new GameState((from, to) => {
    io.emit('tagTransfer', { from, to });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    const clientDist = path.join(__dirname, '../client'); // Assumes dist/server/index.js and dist/client
    app.use(express.static(clientDist));
    app.get('/*', (req, res) => {
        res.sendFile(path.join(clientDist, 'index.html'));
    });
}

import { postManager } from './posts';

// Middleware for parsing JSON
app.use(express.json());

// --- CRUD API Implementation ---
// 1. CREATE
app.post('/api/posts', (req, res) => {
    const { content, author } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });
    const post = postManager.create(content, author || 'Anonymous');
    res.status(201).json(post);
});

// 2. READ
app.get('/api/posts', (req, res) => {
    res.json(postManager.getAll());
});

// 3. UPDATE
app.put('/api/posts/:id', (req, res) => {
    const { content } = req.body;
    const post = postManager.update(req.params.id, content);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
});

// 4. DELETE
app.delete('/api/posts/:id', (req, res) => {
    const success = postManager.delete(req.params.id);
    if (!success) return res.status(404).json({ error: 'Post not found' });
    res.status(204).send();
});
// -------------------------------

io.on('connection', (socket: Socket) => {
    console.log('Player connected:', socket.id);
    const player = gameState.addPlayer(socket.id);

    // Send initial state
    socket.emit('init', {
        id: socket.id,
        players: Array.from(gameState.players.values())
    });
    analytics.track('session_start', socket.id);

    // Broadcast new player
    socket.broadcast.emit('playerJoined', player);

    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        gameState.removePlayer(socket.id);
        io.emit('playerLeft', socket.id);
        analytics.track('session_end', socket.id);
    });

    socket.on('move', (pos: { x: number, y: number }) => {
        // Basic validation
        if (typeof pos.x === 'number' && typeof pos.y === 'number') {
            gameState.movePlayer(socket.id, pos.x, pos.y);
            socket.broadcast.emit('playerMoved', { id: socket.id, position: pos });
        }
    });

    socket.on('chat', (emoji: string) => {
        if (typeof emoji === 'string' && emoji.length < 10) { // Limit length
            gameState.handleChat(socket.id, emoji);
            io.emit('playerChat', { id: socket.id, emoji });
        }
    });
});

httpServer.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
