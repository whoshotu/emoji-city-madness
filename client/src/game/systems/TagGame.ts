import Phaser from 'phaser';
import { socket } from '../../socket';

export interface TagGameState {
    active: boolean;
    itPlayerId: string | null;
    timeRemaining: number;
    scores: Map<string, number>;
}

export class TagGame {
    private scene: Phaser.Scene;
    private state: TagGameState;
    private timerText!: Phaser.GameObjects.Text;
    private itIndicator!: Phaser.GameObjects.Graphics;
    private gameContainer!: Phaser.GameObjects.Container;
    private duration: number = 60; // seconds

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.state = {
            active: false,
            itPlayerId: null,
            timeRemaining: this.duration,
            scores: new Map()
        };
    }

    start(itPlayerId: string) {
        this.state.active = true;
        this.state.itPlayerId = itPlayerId;
        this.state.timeRemaining = this.duration;
        this.state.scores.clear();

        // Create UI
        this.createUI();

        // Start countdown timer
        this.scene.time.addEvent({
            delay: 1000,
            repeat: this.duration - 1,
            callback: () => {
                this.state.timeRemaining--;
                this.updateUI();
                if (this.state.timeRemaining <= 0) {
                    this.end();
                }
            }
        });

        // Announce game start
        this.showAnnouncement('🏃 TAG GAME STARTED!', 'Avoid being IT!');
    }

    private createUI() {
        this.gameContainer = this.scene.add.container(0, 0).setScrollFactor(0);
        this.gameContainer.setDepth(1000);

        // Timer
        this.timerText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            50,
            `⏱️ ${this.state.timeRemaining}s`,
            { fontSize: '28px', color: '#ffffff', backgroundColor: '#ff0000', padding: { x: 16, y: 8 } }
        ).setOrigin(0.5);
        this.gameContainer.add(this.timerText);

        // IT indicator (red glow around IT player)
        this.itIndicator = this.scene.add.graphics();
        this.updateItIndicator();
    }

    private updateUI() {
        if (this.timerText) {
            this.timerText.setText(`⏱️ ${this.state.timeRemaining}s`);
            if (this.state.timeRemaining <= 10) {
                this.timerText.setStyle({ backgroundColor: '#ff0000' });
            }
        }
    }

    private updateItIndicator() {
        // This would highlight the "IT" player with a red glow
        // Actual implementation depends on player reference
    }

    transferTag(fromId: string, toId: string) {
        if (!this.state.active) return;

        this.state.itPlayerId = toId;

        // Award point to tagger
        const score = this.state.scores.get(fromId) || 0;
        this.state.scores.set(fromId, score + 1);

        // Visual feedback
        this.showAnnouncement('🏷️ TAG!', `${fromId.slice(0, 4)} tagged ${toId.slice(0, 4)}!`);

        // Emit to server
        socket.emit('tagTransfer', { from: fromId, to: toId });
    }

    isPlayerIt(playerId: string): boolean {
        return this.state.itPlayerId === playerId;
    }

    private showAnnouncement(title: string, subtitle: string) {
        const container = this.scene.add.container(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2
        ).setScrollFactor(0).setDepth(2000);

        const bg = this.scene.add.rectangle(0, 0, 400, 120, 0x000000, 0.8);
        container.add(bg);

        const titleText = this.scene.add.text(0, -25, title, {
            fontSize: '32px', color: '#ffff00'
        }).setOrigin(0.5);
        container.add(titleText);

        const subText = this.scene.add.text(0, 20, subtitle, {
            fontSize: '20px', color: '#ffffff'
        }).setOrigin(0.5);
        container.add(subText);

        // Fade out
        this.scene.tweens.add({
            targets: container,
            alpha: 0,
            delay: 2000,
            duration: 500,
            onComplete: () => container.destroy()
        });
    }

    end() {
        this.state.active = false;

        // Find winner (most tags)
        let winner = '';
        let highScore = 0;
        this.state.scores.forEach((score, playerId) => {
            if (score > highScore) {
                highScore = score;
                winner = playerId;
            }
        });

        this.showAnnouncement('🏆 GAME OVER!', winner ? `${winner.slice(0, 6)} wins with ${highScore} tags!` : 'No tags!');

        // Cleanup
        if (this.gameContainer) this.gameContainer.destroy();
        if (this.itIndicator) this.itIndicator.destroy();
    }

    isActive(): boolean {
        return this.state.active;
    }

    getItPlayer(): string | null {
        return this.state.itPlayerId;
    }
}
