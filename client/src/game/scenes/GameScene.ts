import Phaser from 'phaser';
import { socket } from '../../socket';
import { Player } from '../entities/Player';
import { Vehicle } from '../entities/Vehicle';
import { CityMap } from '../systems/CityMap';

export class GameScene extends Phaser.Scene {
    private player!: Player;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: { W: Phaser.Input.Keyboard.Key, A: Phaser.Input.Keyboard.Key, S: Phaser.Input.Keyboard.Key, D: Phaser.Input.Keyboard.Key };
    private eKey!: Phaser.Input.Keyboard.Key;
    private remotePlayers: Map<string, Player> = new Map();
    private vehicles: Vehicle[] = [];
    private currentVehicle: Vehicle | null = null;
    private cityMap!: CityMap;
    private colliders!: Phaser.Physics.Arcade.StaticGroup;
    private playerId: string = '';
    private walkSpeed: number = 200;
    private inVehicle: boolean = false;
    private vehicleStatusText!: Phaser.GameObjects.Text;

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

        // Create local player
        const startX = mapSize.width / 2;
        const startY = mapSize.height / 2 + 100;
        const emojis = ['😀', '😎', '🤠', '🥳', '😈', '🤖', '👽', '🎃'];
        const colors = [0xff6600, 0x00aaff, 0xff00ff, 0x00ff00, 0xffff00, 0xff0000];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        this.player = new Player(this, startX, startY, 'YOU', randomEmoji, randomColor);
        this.physics.add.existing(this.player);
        (this.player.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
        (this.player.body as Phaser.Physics.Arcade.Body).setSize(24, 48);
        this.physics.add.collider(this.player, this.colliders);

        // Camera follows player
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, mapSize.width, mapSize.height);

        // Spawn vehicles around the city
        this.spawnVehicles(mapSize);

        // Setup controls
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.wasd = {
            W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };
        this.eKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // Socket.IO events
        this.setupSocketEvents();

        // HUD
        this.createHUD();
    }

    private spawnVehicles(mapSize: { width: number, height: number }) {
        // Spawn cars on roads
        const carPositions = [
            { x: mapSize.width / 2 + 150, y: mapSize.height / 2 - 32 },
            { x: mapSize.width / 2 - 200, y: mapSize.height / 2 - 32 },
            { x: mapSize.width / 2 - 32, y: mapSize.height / 2 + 200 },
        ];
        carPositions.forEach(pos => {
            const car = new Vehicle(this, pos.x, pos.y, 'car');
            this.physics.add.existing(car);
            this.vehicles.push(car);
        });

        // Spawn bikes
        const bike = new Vehicle(this, 300, 300, 'bike');
        this.physics.add.existing(bike);
        this.vehicles.push(bike);

        // Spawn skateboard
        const skateboard = new Vehicle(this, mapSize.width - 200, mapSize.height - 150, 'skateboard');
        this.physics.add.existing(skateboard);
        this.vehicles.push(skateboard);
    }

    private setupSocketEvents() {
        socket.on('init', (data: any) => {
            this.playerId = data.id;
            data.players.forEach((p: any) => {
                if (p.id !== data.id) this.addRemotePlayer(p);
            });
        });

        socket.on('playerJoined', (playerData: any) => {
            if (playerData.id !== this.playerId) this.addRemotePlayer(playerData);
        });

        socket.on('playerMoved', (data: any) => {
            const remotePlayer = this.remotePlayers.get(data.id);
            if (remotePlayer) {
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
            if (remotePlayer) remotePlayer.showChatBubble(data.emoji);
        });
    }

    private addRemotePlayer(playerData: any) {
        const emoji = playerData.avatar?.emoji || '😀';
        const colorStr = playerData.avatar?.color || '#00aaff';
        const color = parseInt(colorStr.replace('#', ''), 16);
        const remotePlayer = new Player(this, playerData.position.x, playerData.position.y, playerData.id, emoji, color);
        this.remotePlayers.set(playerData.id, remotePlayer);
    }

    private createHUD() {
        const hud = this.add.container(0, 0).setScrollFactor(0);

        hud.add(this.add.text(10, 10, 'WASD to Move | E to Enter/Exit Vehicle', {
            fontSize: '14px', color: '#ffffff', backgroundColor: '#000000cc', padding: { x: 8, y: 4 }
        }));

        // Emoji chat buttons
        ['😀', '😂', '😎', '❤️', '👍', '👎'].forEach((emoji, i) => {
            const btn = this.add.text(10 + i * 40, 40, emoji, {
                fontSize: '24px', backgroundColor: '#333333cc', padding: { x: 4, y: 2 }
            }).setInteractive({ useHandCursor: true });
            btn.on('pointerdown', () => {
                socket.emit('chat', emoji);
                this.player.showChatBubble(emoji);
            });
            hud.add(btn);
        });

        // Vehicle indicator
        const vehicleStatus = this.add.text(10, 75, '', {
            fontSize: '14px', color: '#00ff00', backgroundColor: '#000000cc', padding: { x: 8, y: 4 }
        });
        this.vehicleStatusText = vehicleStatus;
        hud.add(vehicleStatus);
    }

    update() {
        if (!this.player || !this.player.body) return;

        const body = this.player.body as Phaser.Physics.Arcade.Body;

        // Check for nearby vehicles (show prompt)
        if (!this.inVehicle) {
            let nearVehicle: Vehicle | null = null;
            for (const vehicle of this.vehicles) {
                const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, vehicle.x, vehicle.y);
                if (dist < 60 && !vehicle.isOccupied) {
                    nearVehicle = vehicle;
                    vehicle.showPrompt(true);
                } else {
                    vehicle.showPrompt(false);
                }
            }

            // Enter vehicle
            if (Phaser.Input.Keyboard.JustDown(this.eKey) && nearVehicle) {
                this.enterVehicle(nearVehicle);
            }
        } else {
            // Exit vehicle
            if (Phaser.Input.Keyboard.JustDown(this.eKey) && this.currentVehicle) {
                this.exitVehicle();
            }
        }

        // Movement
        const speed = this.inVehicle && this.currentVehicle ? this.currentVehicle.getSpeed() : this.walkSpeed;
        const target = this.inVehicle && this.currentVehicle ? this.currentVehicle : this.player;
        const targetBody = target.body as Phaser.Physics.Arcade.Body;

        targetBody.setVelocity(0);
        let moving = false;

        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            targetBody.setVelocityX(-speed);
            moving = true;
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            targetBody.setVelocityX(speed);
            moving = true;
        }
        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            targetBody.setVelocityY(-speed);
            moving = true;
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            targetBody.setVelocityY(speed);
            moving = true;
        }

        if (moving) {
            socket.emit('move', { x: target.x, y: target.y });
        }

        // Update vehicle status text
        if (this.vehicleStatusText) {
            this.vehicleStatusText.setText(this.inVehicle && this.currentVehicle
                ? `🚗 Driving ${this.currentVehicle.vehicleType} | [E] Exit`
                : '');
        }
    }

    private enterVehicle(vehicle: Vehicle) {
        this.inVehicle = true;
        this.currentVehicle = vehicle;
        vehicle.enter(this.player);
        this.cameras.main.startFollow(vehicle, true, 0.1, 0.1);
        this.physics.add.collider(vehicle, this.colliders);
    }

    private exitVehicle() {
        if (!this.currentVehicle) return;
        const exitPos = this.currentVehicle.exit();
        this.player.setPosition(exitPos.x, exitPos.y);
        this.inVehicle = false;
        this.currentVehicle = null;
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    }
}
