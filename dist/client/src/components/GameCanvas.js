"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const socket_1 = require("../socket");
const GameCanvas = () => {
    const canvasRef = (0, react_1.useRef)(null);
    const [me, setMe] = (0, react_1.useState)(null);
    const playersRef = (0, react_1.useRef)(new Map());
    (0, react_1.useEffect)(() => {
        socket_1.socket.on('init', (data) => {
            // Initialize world
            playersRef.current.clear();
            data.players.forEach(p => playersRef.current.set(p.id, p));
            const myPlayer = data.players.find(p => p.id === data.id);
            if (myPlayer)
                setMe(myPlayer);
        });
        socket_1.socket.on('playerJoined', (player) => {
            playersRef.current.set(player.id, player);
        });
        socket_1.socket.on('playerLeft', (id) => {
            playersRef.current.delete(id);
        });
        socket_1.socket.on('playerMoved', (data) => {
            const p = playersRef.current.get(data.id);
            if (p)
                p.position = data.position;
        });
        socket_1.socket.on('playerChat', (data) => {
            const p = playersRef.current.get(data.id);
            if (p) {
                p.lastMessage = { text: data.emoji, timestamp: Date.now() };
            }
        });
        return () => {
            socket_1.socket.off('init');
            socket_1.socket.off('playerJoined');
            socket_1.socket.off('playerLeft');
            socket_1.socket.off('playerMoved');
            socket_1.socket.off('playerChat');
        };
    }, []);
    // Input handling
    (0, react_1.useEffect)(() => {
        const handleKey = (e) => {
            if (!me)
                return;
            const speed = 10;
            let { x, y } = me.position;
            switch (e.key) {
                case 'ArrowUp':
                    y -= speed;
                    break;
                case 'ArrowDown':
                    y += speed;
                    break;
                case 'ArrowLeft':
                    x -= speed;
                    break;
                case 'ArrowRight':
                    x += speed;
                    break;
                default: return;
            }
            // Update local (optimistic)
            const newMe = { ...me, position: { x, y } };
            setMe(newMe);
            playersRef.current.set(me.id, newMe);
            socket_1.socket.emit('move', { x, y });
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [me]);
    // Render loop
    (0, react_1.useEffect)(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        let animId;
        const render = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // Background
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Draw players
            playersRef.current.forEach(p => {
                const { x, y } = p.position;
                // Avatar circle
                ctx.beginPath();
                ctx.arc(x, y, 20, 0, Math.PI * 2);
                ctx.fillStyle = p.avatar.color;
                ctx.fill();
                // Emoji face
                ctx.font = '24px serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(p.avatar.emoji, x, y);
                // Name/ID (truncated)
                ctx.fillStyle = '#fff';
                ctx.font = '10px sans-serif';
                ctx.fillText(p.id.slice(0, 4), x, y + 35);
                // Chat bubble?
                if (p.lastMessage && Date.now() - p.lastMessage.timestamp < 3000) {
                    ctx.font = '30px serif';
                    ctx.fillText(p.lastMessage.text, x, y - 40);
                }
            });
            animId = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(animId);
    }, []);
    return (0, jsx_runtime_1.jsx)("canvas", { ref: canvasRef });
};
exports.default = GameCanvas;
