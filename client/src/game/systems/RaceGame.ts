import Phaser from 'phaser';

export interface Checkpoint {
    x: number;
    y: number;
    reached: boolean;
}

export class RaceGame {
    private scene: Phaser.Scene;
    private active: boolean = false;
    private checkpoints: Checkpoint[] = [];
    private currentCheckpoint: number = 0;
    private startTime: number = 0;
    private uiContainer!: Phaser.GameObjects.Container;
    private checkpointMarkers: Phaser.GameObjects.Arc[] = [];

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    setupCheckpoints(points: { x: number, y: number }[]) {
        this.checkpoints = points.map(p => ({ ...p, reached: false }));
    }

    start() {
        this.active = true;
        this.startTime = Date.now();
        this.currentCheckpoint = 0;
        this.checkpoints.forEach(c => c.reached = false);

        // Create checkpoint markers
        this.checkpointMarkers = [];
        this.checkpoints.forEach((cp, i) => {
            const marker = this.scene.add.circle(cp.x, cp.y, 30, i === 0 ? 0x00ff00 : 0xffff00, 0.5);
            marker.setStrokeStyle(3, 0xffffff);
            this.checkpointMarkers.push(marker);

            // Number label
            this.scene.add.text(cp.x, cp.y, `${i + 1}`, {
                fontSize: '20px', color: '#ffffff'
            }).setOrigin(0.5);
        });

        // UI
        this.createUI();
        this.showAnnouncement('🏁 RACE STARTED!', 'Reach all checkpoints!');
    }

    private createUI() {
        this.uiContainer = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(1000);

        const progressText = this.scene.add.text(
            this.scene.cameras.main.width - 150, 50,
            this.getProgressText(),
            { fontSize: '18px', color: '#ffffff', backgroundColor: '#0000ffcc', padding: { x: 10, y: 6 } }
        );
        this.uiContainer.add(progressText);
        this.uiContainer.setData('progressText', progressText);
    }

    private getProgressText(): string {
        return `🚩 ${this.currentCheckpoint}/${this.checkpoints.length}`;
    }

    checkCheckpoint(playerX: number, playerY: number): boolean {
        if (!this.active || this.currentCheckpoint >= this.checkpoints.length) return false;

        const cp = this.checkpoints[this.currentCheckpoint];
        const dist = Phaser.Math.Distance.Between(playerX, playerY, cp.x, cp.y);

        if (dist < 40) {
            cp.reached = true;

            // Update marker
            if (this.checkpointMarkers[this.currentCheckpoint]) {
                this.checkpointMarkers[this.currentCheckpoint].setFillStyle(0x00ff00, 0.8);
            }

            this.currentCheckpoint++;

            // Update progress UI
            const progressText = this.uiContainer.getData('progressText') as Phaser.GameObjects.Text;
            if (progressText) progressText.setText(this.getProgressText());

            // Check if finished
            if (this.currentCheckpoint >= this.checkpoints.length) {
                this.finish();
            } else {
                // Highlight next checkpoint
                if (this.checkpointMarkers[this.currentCheckpoint]) {
                    this.checkpointMarkers[this.currentCheckpoint].setFillStyle(0x00ff00, 0.5);
                }
            }

            return true;
        }
        return false;
    }

    private finish() {
        this.active = false;
        const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);
        this.showAnnouncement('🏆 RACE COMPLETE!', `Time: ${elapsed}s`);

        // Cleanup after delay
        this.scene.time.delayedCall(3000, () => {
            this.cleanup();
        });
    }

    private cleanup() {
        this.checkpointMarkers.forEach(m => m.destroy());
        this.checkpointMarkers = [];
        if (this.uiContainer) this.uiContainer.destroy();
    }

    private showAnnouncement(title: string, subtitle: string) {
        const container = this.scene.add.container(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2
        ).setScrollFactor(0).setDepth(2000);

        container.add(this.scene.add.rectangle(0, 0, 400, 120, 0x0000aa, 0.9));
        container.add(this.scene.add.text(0, -25, title, { fontSize: '32px', color: '#ffffff' }).setOrigin(0.5));
        container.add(this.scene.add.text(0, 20, subtitle, { fontSize: '20px', color: '#ffff00' }).setOrigin(0.5));

        this.scene.tweens.add({
            targets: container,
            alpha: 0,
            delay: 2500,
            duration: 500,
            onComplete: () => container.destroy()
        });
    }

    isActive(): boolean {
        return this.active;
    }

    cancel() {
        this.active = false;
        this.cleanup();
    }
}
