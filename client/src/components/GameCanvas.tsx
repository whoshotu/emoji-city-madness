import React, { useEffect, useRef, useState } from 'react';
import { socket } from '../socket';
import { Player } from '../types';

const GameCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [me, setMe] = useState<Player | null>(null);
    const playersRef = useRef<Map<string, Player>>(new Map());

    useEffect(() => {
        socket.on('init', (data: { id: string, players: Player[] }) => {
            // Initialize world
            playersRef.current.clear();
            data.players.forEach(p => playersRef.current.set(p.id, p));
            const myPlayer = data.players.find(p => p.id === data.id);
            if (myPlayer) setMe(myPlayer);
        });

        socket.on('playerJoined', (player: Player) => {
            playersRef.current.set(player.id, player);
        });

        socket.on('playerLeft', (id: string) => {
            playersRef.current.delete(id);
        });

        socket.on('playerMoved', (data: { id: string, position: { x: number, y: number } }) => {
            const p = playersRef.current.get(data.id);
            if (p) p.position = data.position;
        });

        socket.on('playerChat', (data: { id: string, emoji: string }) => {
            const p = playersRef.current.get(data.id);
            if (p) {
                p.lastMessage = { text: data.emoji, timestamp: Date.now() };
            }
        });

        return () => {
            socket.off('init');
            socket.off('playerJoined');
            socket.off('playerLeft');
            socket.off('playerMoved');
            socket.off('playerChat');
        };
    }, []);

    // Input handling
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (!me) return;
            const speed = 10;
            let { x, y } = me.position;

            switch (e.key) {
                case 'ArrowUp': y -= speed; break;
                case 'ArrowDown': y += speed; break;
                case 'ArrowLeft': x -= speed; break;
                case 'ArrowRight': x += speed; break;
                default: return;
            }

            // Update local (optimistic)
            const newMe = { ...me, position: { x, y } };
            setMe(newMe);
            playersRef.current.set(me.id, newMe);
            socket.emit('move', { x, y });
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [me]);

    // Render loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animId: number;

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

    return <canvas ref={canvasRef} />;
};

export default GameCanvas;
