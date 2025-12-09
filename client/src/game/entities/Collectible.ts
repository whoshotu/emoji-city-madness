import Phaser from 'phaser';

export class Collectible extends Phaser.GameObjects.Container {
    private sprite: Phaser.GameObjects.Text;
    private glow: Phaser.GameObjects.Arc;
    public type: 'coin' | 'gem' | 'powerup';
    public value: number;
    public collected: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, type: 'coin' | 'gem' | 'powerup' = 'coin') {
        super(scene, x, y);
        this.type = type;
        this.value = type === 'gem' ? 5 : 1;

        // Glow effect
        const glowColor = type === 'gem' ? 0x00ffff : 0xffff00;
        this.glow = scene.add.circle(0, 0, 18, glowColor, 0.3);
        this.add(this.glow);

        // Emoji sprite
        const emoji = type === 'coin' ? '💰' : type === 'gem' ? '💎' : '⚡';
        this.sprite = scene.add.text(0, 0, emoji, {
            fontSize: '24px'
        }).setOrigin(0.5);
        this.add(this.sprite);

        scene.add.existing(this);

        // Floating animation
        scene.tweens.add({
            targets: this,
            y: y - 8,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Glow pulse
        scene.tweens.add({
            targets: this.glow,
            scale: 1.3,
            alpha: 0.1,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Slow rotation for gems
        if (type === 'gem') {
            scene.tweens.add({
                targets: this.sprite,
                angle: 360,
                duration: 3000,
                repeat: -1,
                ease: 'Linear'
            });
        }
    }

    collect(onComplete?: () => void) {
        if (this.collected) return;
        this.collected = true;

        // Collection animation
        this.scene.tweens.add({
            targets: this,
            scale: 1.5,
            alpha: 0,
            y: this.y - 50,
            duration: 300,
            ease: 'Quad.easeOut',
            onComplete: () => {
                if (onComplete) onComplete();
                this.destroy();
            }
        });
    }
}

export class CollectibleSpawner {
    private scene: Phaser.Scene;
    private collectibles: Collectible[] = [];
    private spawnTimer: Phaser.Time.TimerEvent | null = null;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    spawnInitial(count: number = 15, mapWidth: number = 1280, mapHeight: number = 960) {
        for (let i = 0; i < count; i++) {
            const x = Phaser.Math.Between(100, mapWidth - 100);
            const y = Phaser.Math.Between(100, mapHeight - 100);
            const type = Math.random() < 0.1 ? 'gem' : 'coin';
            const collectible = new Collectible(this.scene, x, y, type);
            this.collectibles.push(collectible);
        }
    }

    startRespawning(interval: number = 10000) {
        this.spawnTimer = this.scene.time.addEvent({
            delay: interval,
            callback: this.spawnRandom,
            callbackScope: this,
            loop: true
        });
    }

    private spawnRandom() {
        if (this.collectibles.filter(c => !c.collected).length >= 20) return;

        const x = Phaser.Math.Between(100, 1200);
        const y = Phaser.Math.Between(100, 850);
        const type = Math.random() < 0.15 ? 'gem' : 'coin';
        const collectible = new Collectible(this.scene, x, y, type);
        this.collectibles.push(collectible);
    }

    getCollectibles(): Collectible[] {
        return this.collectibles.filter(c => !c.collected);
    }

    checkCollection(playerX: number, playerY: number, radius: number = 30): Collectible | null {
        for (const collectible of this.collectibles) {
            if (collectible.collected) continue;
            const dist = Phaser.Math.Distance.Between(playerX, playerY, collectible.x, collectible.y);
            if (dist < radius) {
                return collectible;
            }
        }
        return null;
    }
}
