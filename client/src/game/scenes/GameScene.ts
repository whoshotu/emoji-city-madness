import Phaser from 'phaser';
import { socket } from '../../socket';
import { Player } from '../entities/Player';
import { CityMap } from '../systems/CityMap';

export class GameScene extends Phaser.Scene {
    private player!: Player;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: { W: Phaser.Input.Keyboard.Key, A: Phaser.Input.Keyboard.Key, S: Phaser.Input.Keyboard.Key, D: Phaser.Input.Keyboard.Key };
    private remotePlayers: Map<string, Player> = new Map();
    private cityMap!: CityMap;
    private colliders!: Phaser.Physics.Arcade.StaticGroup;
    private playerId: string = '';
    private speed: number = 200;

    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // Generate city map
        this.cityMap = new CityMap(this);
        this.colliders = this.cityMap.generate();

        const mapSize = this.cityMap.getMapSize();

        // Set world bounds
        this.physics.world.setBounds(0, 0, mapSize.width, mapSize.height);

        // Create local player at center
        const startX = mapSize.width / 2;
        const startY = mapSize.height / 2 + 100;

        // Random emoji and color for variety
        const emojis = ['😀', '😎', '🤠', '🥳', '😈', '🤖', '👽', '🎃'];
        const colors = [0xff6600, 0x00aaff, 0xff00ff, 0x00ff00, 0xffff00, 0xff0000];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        this.player = new Player(this, startX, startY, 'YOU', randomEmoji, randomColor);
        this.physics.add.existing(this.player);
        (this.player.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
        (this.player.body as Phaser.Physics.Arcade.Body).setSize(24, 48);

        // Player collides with buildings
        this.physics.add.collider(this.player, this.colliders);

        // Camera follows player
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, mapSize.width, mapSize.height);

        // Setup controls
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.wasd = {
            W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };

        // Socket.IO integration
        socket.on('init', (data: any) => {
            console.log('Connected to server:', data.id);
            this.playerId = data.id;

            // Add existing players
            data.players.forEach((p: any) => {
                if (p.id !== data.id) {
                    this.addRemotePlayer(p);
                }
            });
        });

        socket.on('playerJoined', (playerData: any) => {
            if (playerData.id !== this.playerId) {
                this.addRemotePlayer(playerData);
            }
        });

        socket.on('playerMoved', (data: any) => {
            const remotePlayer = this.remotePlayers.get(data.id);
            if (remotePlayer) {
                // Smooth interpolation
                this.tweens.add({
                    targets: remotePlayer,
                    x: data.position.x,
                    y: data.position.y,
                    duration: 100,
                    ease: 'Linear'
                });
            }
        });

        socket.on('playerLeft', (id: string) => {
            const remotePlayer = this.remotePlayers.get(id);
            if (remotePlayer) {
                remotePlayer.destroy();
                this.remotePlayers.delete(id);
            }
        });

        socket.on('playerChat', (data: any) => {
            const remotePlayer = this.remotePlayers.get(data.id);
            if (remotePlayer) {
                remotePlayer.showChatBubble(data.emoji);
            }
        });

        // HUD
        this.createHUD();
    }

    private addRemotePlayer(playerData: any) {
        const emoji = playerData.avatar?.emoji || '😀';
        const colorStr = playerData.avatar?.color || '#00aaff';
        const color = parseInt(colorStr.replace('#', ''), 16);

        const remotePlayer = new Player(
            this,
            playerData.position.x,
            playerData.position.y,
            playerData.id,
            emoji,
            color
        );
        this.remotePlayers.set(playerData.id, remotePlayer);
    }

    private createHUD() {
        // Fixed HUD container
        const hud = this.add.container(0, 0).setScrollFactor(0);

        // Instructions
        const instructions = this.add.text(10, 10, 'WASD / Arrows to Move', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#000000cc',
            padding: { x: 8, y: 4 }
        });
        hud.add(instructions);

        // Emoji buttons for chat
        const emojis = ['😀', '😂', '😎', '❤️', '👍', '👎'];
        emojis.forEach((emoji, i) => {
            const btn = this.add.text(10 + i * 45, 40, emoji, {
                fontSize: '28px',
                backgroundColor: '#333333cc',
                padding: { x: 6, y: 4 }
            }).setInteractive({ useHandCursor: true });

            btn.on('pointerdown', () => {
                socket.emit('chat', emoji);
                this.player.showChatBubble(emoji);
            });

            hud.add(btn);
        });

        // Zone indicator (bottom)
        const zoneText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 30, '📍 CITY CENTER', {
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#000000aa',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5);
        hud.add(zoneText);
    }

    update() {
        if (!this.player || !this.player.body) return;

        const body = this.player.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(0);

        // Movement
        let moving = false;
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            body.setVelocityX(-this.speed);
            moving = true;
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            body.setVelocityX(this.speed);
            moving = true;
        }

        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            body.setVelocityY(-this.speed);
            moving = true;
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            body.setVelocityY(this.speed);
            moving = true;
        }

        // Emit position to server
        if (moving) {
            socket.emit('move', { x: this.player.x, y: this.player.y });
        }
    }
}
