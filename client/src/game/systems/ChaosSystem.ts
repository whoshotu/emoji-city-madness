import Phaser from 'phaser';

// Random chaos events for brainrot vibes
export interface ChaosEvent {
    name: string;
    duration: number;
    effect: (scene: Phaser.Scene) => void;
    cleanup?: () => void;
}

export class ChaosSystem {
    private scene: Phaser.Scene;
    private activeEvent: ChaosEvent | null = null;
    private eventTimer: Phaser.Time.TimerEvent | null = null;
    private announcementContainer: Phaser.GameObjects.Container | null = null;

    private events: ChaosEvent[] = [
        {
            name: '🌈 RAINBOW MODE',
            duration: 10000,
            effect: (scene) => {
                // Rainbow background flash
                scene.cameras.main.setBackgroundColor(0xff00ff);
                scene.time.addEvent({
                    delay: 500,
                    repeat: 19,
                    callback: () => {
                        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
                        scene.cameras.main.setBackgroundColor(colors[Math.floor(Math.random() * colors.length)]);
                    }
                });
            },
            cleanup: () => { }
        },
        {
            name: '⚡ SPEED BOOST',
            duration: 8000,
            effect: () => {
                // Speed is doubled (handled in GameScene)
            }
        },
        {
            name: '🎲 EMOJI SHUFFLE',
            duration: 5000,
            effect: () => {
                // Players' emojis change randomly (visual glitch effect)
            }
        },
        {
            name: '👻 GHOST MODE',
            duration: 6000,
            effect: (scene) => {
                // Make everything semi-transparent
                scene.cameras.main.setAlpha(0.5);
            },
            cleanup: () => { }
        },
        {
            name: '🔥 CHAOS MODE',
            duration: 12000,
            effect: (scene) => {
                // Screen shake
                scene.cameras.main.shake(12000, 0.002);
            }
        },
        {
            name: '💰 COIN RAIN',
            duration: 8000,
            effect: (scene) => {
                // Spawn falling coins (visual)
                const spawnCoins = () => {
                    for (let i = 0; i < 5; i++) {
                        const coin = scene.add.text(
                            Phaser.Math.Between(0, scene.cameras.main.width),
                            -50,
                            '💰',
                            { fontSize: '24px' }
                        ).setScrollFactor(0).setDepth(500);
                        scene.tweens.add({
                            targets: coin,
                            y: scene.cameras.main.height + 50,
                            x: coin.x + Phaser.Math.Between(-100, 100),
                            duration: Phaser.Math.Between(2000, 4000),
                            ease: 'Quad.easeIn',
                            onComplete: () => coin.destroy()
                        });
                    }
                };
                scene.time.addEvent({
                    delay: 500,
                    repeat: 15,
                    callback: spawnCoins
                });
            }
        }
    ];

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.startRandomEvents();
    }

    private startRandomEvents() {
        // Random event every 30-60 seconds
        this.eventTimer = this.scene.time.addEvent({
            delay: Phaser.Math.Between(30000, 60000),
            callback: this.triggerRandomEvent,
            callbackScope: this,
            loop: true
        });
    }

    triggerRandomEvent() {
        if (this.activeEvent) return;

        const event = this.events[Math.floor(Math.random() * this.events.length)];
        this.activeEvent = event;

        // Show announcement
        this.showAnnouncement(event.name);

        // Apply effect
        event.effect(this.scene);

        // Cleanup after duration
        this.scene.time.delayedCall(event.duration, () => {
            if (event.cleanup) event.cleanup();
            this.scene.cameras.main.setBackgroundColor(0x2c3e50);
            this.scene.cameras.main.setAlpha(1);
            this.activeEvent = null;
        });
    }

    private showAnnouncement(text: string) {
        this.announcementContainer = this.scene.add.container(
            this.scene.cameras.main.width / 2,
            100
        ).setScrollFactor(0).setDepth(1000);

        const bg = this.scene.add.rectangle(0, 0, 400, 60, 0x000000, 0.9);
        this.announcementContainer.add(bg);

        const title = this.scene.add.text(0, 0, text, {
            fontSize: '28px', fontFamily: 'Arial Black', color: '#ffff00'
        }).setOrigin(0.5);
        this.announcementContainer.add(title);

        // Animate in
        this.announcementContainer.setScale(0);
        this.scene.tweens.add({
            targets: this.announcementContainer,
            scale: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });

        // Animate out
        this.scene.tweens.add({
            targets: this.announcementContainer,
            alpha: 0,
            y: 50,
            delay: 3000,
            duration: 500,
            onComplete: () => {
                if (this.announcementContainer) {
                    this.announcementContainer.destroy();
                    this.announcementContainer = null;
                }
            }
        });
    }

    getActiveEvent(): ChaosEvent | null {
        return this.activeEvent;
    }

    // Force trigger for testing
    forceEvent(eventName?: string) {
        if (eventName) {
            const event = this.events.find(e => e.name.includes(eventName));
            if (event) {
                this.activeEvent = event;
                this.showAnnouncement(event.name);
                event.effect(this.scene);
            }
        } else {
            this.triggerRandomEvent();
        }
    }
}
