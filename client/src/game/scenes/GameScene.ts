import Phaser from 'phaser';
import { socket } from '../../socket';
import { Player } from '../entities/Player';
import { Vehicle } from '../entities/Vehicle';
import { CityMap } from '../systems/CityMap';
import { SoundManager } from '../systems/SoundManager';

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
    private inVehicle: boolean = false;
    private vehicleStatusText!: Phaser.GameObjects.Text;
    private soundManager!: SoundManager;

    // Smooth movement physics
    private maxWalkSpeed: number = 200;
    private maxVehicleSpeed: number = 350;
    private acceleration: number = 800;
    private deceleration: number = 600;
    private velocityX: number = 0;
    private velocityY: number = 0;
    private lastSentPosition = { x: 0, y: 0 };
    private wasMoving: boolean = false;

    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // Initialize sound manager
        this.soundManager = new SoundManager(this);

        // Generate city map
        this.cityMap = new CityMap(this);
        this.colliders = this.cityMap.generate();
        const mapSize = this.cityMap.getMapSize();

        // Set world bounds
        this.physics.world.setBounds(0, 0, mapSize.width, mapSize.height);

        // Create local player
        const startX = mapSize.width / 2;
        const startY = mapSize.height / 2 + 100;
        const emojis = ['😀', '😎', '🤠', '🥳', '😈', '🤖', '👽', '🎃', '🔥', '💀'];
        const colors = [0xff6600, 0x00aaff, 0xff00ff, 0x00ff00, 0xffff00, 0xff0000, 0x9900ff];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        this.player = new Player(this, startX, startY, 'YOU', randomEmoji, randomColor);
        this.physics.add.existing(this.player);
        const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
        playerBody.setCollideWorldBounds(true);
        playerBody.setSize(24, 48);
        playerBody.setDrag(this.deceleration, this.deceleration);
        playerBody.setMaxVelocity(this.maxWalkSpeed, this.maxWalkSpeed);
        this.physics.add.collider(this.player, this.colliders);

        // Camera with smooth follow
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setBounds(0, 0, mapSize.width, mapSize.height);

        // Spawn vehicles
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

        // Click anywhere to enable audio (browser requirement)
        this.input.once('pointerdown', () => {
            this.soundManager.play('pop');
        });
    }

    private spawnVehicles(mapSize: { width: number, height: number }) {
        const carPositions = [
            { x: mapSize.width / 2 + 150, y: mapSize.height / 2 - 32 },
            { x: mapSize.width / 2 - 200, y: mapSize.height / 2 - 32 },
            { x: mapSize.width / 2 - 32, y: mapSize.height / 2 + 200 },
        ];
        carPositions.forEach(pos => {
            const car = new Vehicle(this, pos.x, pos.y, 'car');
            this.physics.add.existing(car);
            (car.body as Phaser.Physics.Arcade.Body).setDrag(800, 800);
            this.vehicles.push(car);
        });

        const bike = new Vehicle(this, 300, 300, 'bike');
        this.physics.add.existing(bike);
        (bike.body as Phaser.Physics.Arcade.Body).setDrag(800, 800);
        this.vehicles.push(bike);

        const skateboard = new Vehicle(this, mapSize.width - 200, mapSize.height - 150, 'skateboard');
        this.physics.add.existing(skateboard);
        (skateboard.body as Phaser.Physics.Arcade.Body).setDrag(800, 800);
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
            if (playerData.id !== this.playerId) {
                this.addRemotePlayer(playerData);
                this.soundManager.play('pop');
            }
        });

        socket.on('playerMoved', (data: any) => {
            const remotePlayer = this.remotePlayers.get(data.id);
            if (remotePlayer) {
                // Check if moving
                const dist = Phaser.Math.Distance.Between(remotePlayer.x, remotePlayer.y, data.position.x, data.position.y);
                if (dist > 2) {
                    remotePlayer.startWalking();
                } else {
                    remotePlayer.stopWalking();
                }
                // Smooth interpolation
                this.tweens.add({
                    targets: remotePlayer,
                    x: data.position.x,
                    y: data.position.y,
                    duration: 80,
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
                this.soundManager.play('pop');
            }
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
        const hud = this.add.container(0, 0).setScrollFactor(0).setDepth(100);

        // Instructions with better styling
        const instructions = this.add.text(10, 10, '🎮 WASD to Move | E for Vehicles | Click emoji to chat', {
            fontSize: '14px', fontFamily: 'Arial', color: '#ffffff',
            backgroundColor: '#000000cc', padding: { x: 10, y: 6 }
        });
        hud.add(instructions);

        // Emoji chat buttons with hover effects
        const emojis = ['😀', '😂', '😎', '❤️', '👍', '🔥', '💀', '👻'];
        emojis.forEach((emoji, i) => {
            const btn = this.add.text(10 + i * 38, 45, emoji, {
                fontSize: '24px', backgroundColor: '#333333dd', padding: { x: 4, y: 2 }
            }).setInteractive({ useHandCursor: true });

            btn.on('pointerover', () => btn.setScale(1.2));
            btn.on('pointerout', () => btn.setScale(1));
            btn.on('pointerdown', () => {
                socket.emit('chat', emoji);
                this.player.showChatBubble(emoji);
                this.soundManager.play('pop');
            });
            hud.add(btn);
        });

        // Vehicle status
        this.vehicleStatusText = this.add.text(10, 85, '', {
            fontSize: '14px', color: '#00ff00', backgroundColor: '#000000cc', padding: { x: 8, y: 4 }
        });
        hud.add(this.vehicleStatusText);

        // Sound toggle button
        const soundBtn = this.add.text(this.cameras.main.width - 50, 10, '🔊', {
            fontSize: '24px', backgroundColor: '#333333dd', padding: { x: 6, y: 4 }
        }).setInteractive({ useHandCursor: true });
        soundBtn.on('pointerdown', () => {
            const muted = this.soundManager.toggleMute();
            soundBtn.setText(muted ? '🔇' : '🔊');
        });
        hud.add(soundBtn);
    }

    update(_time: number, delta: number) {
        if (!this.player || !this.player.body) return;

        const body = this.player.body as Phaser.Physics.Arcade.Body;
        const maxSpeed = this.inVehicle && this.currentVehicle ? this.currentVehicle.getSpeed() : this.maxWalkSpeed;

        // Check for nearby vehicles
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
            if (Phaser.Input.Keyboard.JustDown(this.eKey) && nearVehicle) {
                this.enterVehicle(nearVehicle);
            }
        } else {
            if (Phaser.Input.Keyboard.JustDown(this.eKey) && this.currentVehicle) {
                this.exitVehicle();
            }
        }

        // Smooth acceleration-based movement
        const target = this.inVehicle && this.currentVehicle ? this.currentVehicle : this.player;
        const targetBody = target.body as Phaser.Physics.Arcade.Body;

        let inputX = 0;
        let inputY = 0;

        if (this.cursors.left.isDown || this.wasd.A.isDown) inputX = -1;
        else if (this.cursors.right.isDown || this.wasd.D.isDown) inputX = 1;

        if (this.cursors.up.isDown || this.wasd.W.isDown) inputY = -1;
        else if (this.cursors.down.isDown || this.wasd.S.isDown) inputY = 1;

        // Normalize diagonal movement
        if (inputX !== 0 && inputY !== 0) {
            inputX *= 0.707;
            inputY *= 0.707;
        }

        // Apply acceleration
        if (inputX !== 0) {
            targetBody.setAccelerationX(inputX * this.acceleration);
        } else {
            targetBody.setAccelerationX(0);
        }

        if (inputY !== 0) {
            targetBody.setAccelerationY(inputY * this.acceleration);
        } else {
            targetBody.setAccelerationY(0);
        }

        // Clamp max speed
        targetBody.setMaxVelocity(maxSpeed, maxSpeed);

        // Walking animation
        const isMoving = inputX !== 0 || inputY !== 0;
        if (!this.inVehicle) {
            if (isMoving && !this.wasMoving) {
                this.player.startWalking();
            } else if (!isMoving && this.wasMoving) {
                this.player.stopWalking();
            }
        }
        this.wasMoving = isMoving;

        // Network sync (throttled)
        const currentPos = { x: Math.round(target.x), y: Math.round(target.y) };
        const dist = Phaser.Math.Distance.Between(this.lastSentPosition.x, this.lastSentPosition.y, currentPos.x, currentPos.y);
        if (dist > 3) {
            socket.emit('move', currentPos);
            this.lastSentPosition = currentPos;
        }

        // Update vehicle status
        if (this.vehicleStatusText) {
            this.vehicleStatusText.setText(this.inVehicle && this.currentVehicle
                ? `🚗 Driving ${this.currentVehicle.vehicleType.toUpperCase()} | [E] to Exit`
                : '');
        }
    }

    private enterVehicle(vehicle: Vehicle) {
        this.inVehicle = true;
        this.currentVehicle = vehicle;
        vehicle.enter(this.player);
        this.player.stopWalking();
        this.cameras.main.startFollow(vehicle, true, 0.08, 0.08);
        this.physics.add.collider(vehicle, this.colliders);
        this.soundManager.play('carStart');
    }

    private exitVehicle() {
        if (!this.currentVehicle) return;
        const exitPos = this.currentVehicle.exit();
        this.player.setPosition(exitPos.x, exitPos.y);
        this.player.squash();
        this.inVehicle = false;
        this.currentVehicle = null;
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.soundManager.play('pop');
    }
}
