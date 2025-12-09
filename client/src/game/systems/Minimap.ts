import Phaser from 'phaser';

export class Minimap {
    private scene: Phaser.Scene;
    private container: Phaser.GameObjects.Container;
    private mapGraphics: Phaser.GameObjects.Graphics;
    private playerDot: Phaser.GameObjects.Arc;
    private otherPlayerDots: Map<string, Phaser.GameObjects.Arc> = new Map();
    private scale: number;
    private mapWidth: number;
    private mapHeight: number;
    private minimapWidth: number = 150;
    private minimapHeight: number = 100;

    constructor(scene: Phaser.Scene, mapWidth: number, mapHeight: number) {
        this.scene = scene;
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.scale = this.minimapWidth / mapWidth;

        // Position in bottom-right corner
        const x = scene.cameras.main.width - this.minimapWidth - 15;
        const y = scene.cameras.main.height - this.minimapHeight - 15;

        this.container = scene.add.container(x, y).setScrollFactor(0).setDepth(200);

        // Background
        const bg = scene.add.rectangle(0, 0, this.minimapWidth, this.minimapHeight, 0x000000, 0.7);
        bg.setOrigin(0, 0);
        bg.setStrokeStyle(2, 0xffffff);
        this.container.add(bg);

        // Map graphics (roads, buildings)
        this.mapGraphics = scene.add.graphics();
        this.container.add(this.mapGraphics);
        this.drawMap();

        // Player dot (you = green)
        this.playerDot = scene.add.circle(0, 0, 4, 0x00ff00);
        this.container.add(this.playerDot);

        // Label
        const label = scene.add.text(this.minimapWidth / 2, -10, '🗺️ MAP', {
            fontSize: '10px', color: '#ffffff'
        }).setOrigin(0.5);
        this.container.add(label);
    }

    private drawMap() {
        this.mapGraphics.clear();

        // Draw simplified city layout
        // Roads (gray)
        this.mapGraphics.fillStyle(0x666666);
        // Horizontal road
        this.mapGraphics.fillRect(0, this.minimapHeight / 2 - 3, this.minimapWidth, 6);
        // Vertical road
        this.mapGraphics.fillRect(this.minimapWidth / 2 - 3, 0, 6, this.minimapHeight);

        // Buildings (brown squares)
        this.mapGraphics.fillStyle(0x8b4513);
        this.mapGraphics.fillRect(10, 10, 20, 20); // Top-left
        this.mapGraphics.fillRect(this.minimapWidth - 35, 10, 25, 20); // Top-right
        this.mapGraphics.fillRect(10, this.minimapHeight - 25, 20, 15); // Bottom-left
        this.mapGraphics.fillRect(this.minimapWidth - 30, this.minimapHeight - 25, 20, 20); // Bottom-right

        // Beach (sand/blue)
        this.mapGraphics.fillStyle(0xf4e4bc);
        this.mapGraphics.fillRect(this.minimapWidth - 25, this.minimapHeight - 20, 20, 15);
        this.mapGraphics.fillStyle(0x4a90d9);
        this.mapGraphics.fillRect(this.minimapWidth - 25, this.minimapHeight - 8, 20, 5);

        // Park (green)
        this.mapGraphics.fillStyle(0x228b22);
        this.mapGraphics.fillRect(5, this.minimapHeight - 20, 25, 15);
    }

    updatePlayerPosition(x: number, y: number) {
        const minimapX = (x / this.mapWidth) * this.minimapWidth;
        const minimapY = (y / this.mapHeight) * this.minimapHeight;
        this.playerDot.setPosition(
            Phaser.Math.Clamp(minimapX, 4, this.minimapWidth - 4),
            Phaser.Math.Clamp(minimapY, 4, this.minimapHeight - 4)
        );
    }

    updateOtherPlayer(id: string, x: number, y: number) {
        let dot = this.otherPlayerDots.get(id);
        if (!dot) {
            dot = this.scene.add.circle(0, 0, 3, 0x00aaff);
            this.container.add(dot);
            this.otherPlayerDots.set(id, dot);
        }

        const minimapX = (x / this.mapWidth) * this.minimapWidth;
        const minimapY = (y / this.mapHeight) * this.minimapHeight;
        dot.setPosition(
            Phaser.Math.Clamp(minimapX, 3, this.minimapWidth - 3),
            Phaser.Math.Clamp(minimapY, 3, this.minimapHeight - 3)
        );
    }

    removePlayer(id: string) {
        const dot = this.otherPlayerDots.get(id);
        if (dot) {
            dot.destroy();
            this.otherPlayerDots.delete(id);
        }
    }
}
