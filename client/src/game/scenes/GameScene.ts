import Phaser from 'phaser';
import { socket } from '../../socket';

export class GameScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Rectangle;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private remotePlayers: Map<string, Phaser.GameObjects.Rectangle> = new Map();

    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background (placeholder city)
        this.add.rectangle(0, 0, width, height, 0x3a6b3a).setOrigin(0); // Green grass

        // Grid lines (streets placeholder)
        const graphics = this.add.graphics();
        graphics.lineStyle(4, 0x999999, 1);
        for (let x = 0; x < width; x += 100) {
            graphics.lineBetween(x, 0, x, height);
        }
        for (let y = 0; y < height; y += 100) {
            graphics.lineBetween(0, y, width, y);
        }

        // Create player (blocky character - placeholder)
        this.player = this.add.rectangle(width / 2, height / 2, 32, 48, 0xff6600);

        // Add emoji "head"
        const emojiText = this.add.text(this.player.x, this.player.y - 10, '😀', {
            fontSize: '32px'
        }).setOrigin(0.5);

        // Setup controls
        this.cursors = this.input.keyboard!.createCursorKeys();

        // Socket.IO integration
        socket.on('init', (data: any) => {
            console.log('Connected to server:', data.id);
        });

        socket.on('playerJoined', (player: any) => {
            const remotePlayer = this.add.rectangle(player.position.x, player.position.y, 32, 48, 0x00aaff);
            this.remotePlayers.set(player.id, remotePlayer);
        });

        socket.on('playerMoved', (data: any) => {
            const remotePlayer = this.remotePlayers.get(data.id);
            if (remotePlayer) {
                remotePlayer.setPosition(data.position.x, data.position.y);
            }
        });

        socket.on('playerLeft', (id: string) => {
            const remotePlayer = this.remotePlayers.get(id);
            if (remotePlayer) {
                remotePlayer.destroy();
                this.remotePlayers.delete(id);
            }
        });

        // HUD
        this.add.text(10, 10, 'Arrow Keys to Move | ESC for Menu', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        });
    }

    update() {
        if (!this.player) return;

        const speed = 5;
        let moved = false;

        if (this.cursors.left.isDown) {
            this.player.x -= speed;
            moved = true;
        } else if (this.cursors.right.isDown) {
            this.player.x += speed;
            moved = true;
        }

        if (this.cursors.up.isDown) {
            this.player.y -= speed;
            moved = true;
        } else if (this.cursors.down.isDown) {
            this.player.y += speed;
            moved = true;
        }

        // Send position to server
        if (moved) {
            socket.emit('move', { x: this.player.x, y: this.player.y });
        }
    }
}
