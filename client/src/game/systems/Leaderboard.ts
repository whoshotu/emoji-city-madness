import Phaser from 'phaser';

export interface LeaderboardEntry {
    id: string;
    name: string;
    coins: number;
    emoji: string;
}

export class Leaderboard {
    private scene: Phaser.Scene;
    private container: Phaser.GameObjects.Container;
    private entries: LeaderboardEntry[] = [];
    private isVisible: boolean = true;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        // Position on left side below mission panel
        this.container = scene.add.container(10, 220).setScrollFactor(0).setDepth(100);

        this.createUI();
    }

    private createUI() {
        // Background
        const bg = this.scene.add.rectangle(0, 0, 180, 130, 0x000000, 0.8);
        bg.setOrigin(0, 0);
        bg.setStrokeStyle(2, 0x00ffff);
        this.container.add(bg);

        // Header
        const header = this.scene.add.text(10, 8, '🏆 LEADERBOARD', {
            fontSize: '12px', fontFamily: 'Arial', color: '#00ffff'
        });
        this.container.add(header);

        // Initially show placeholder
        this.updateDisplay();
    }

    updateEntries(entries: LeaderboardEntry[]) {
        this.entries = entries.sort((a, b) => b.coins - a.coins).slice(0, 5);
        this.updateDisplay();
    }

    addLocalPlayer(id: string, name: string, coins: number, emoji: string) {
        const existing = this.entries.findIndex(e => e.id === id);
        if (existing >= 0) {
            this.entries[existing].coins = coins;
        } else {
            this.entries.push({ id, name, coins, emoji });
        }
        this.updateEntries(this.entries);
    }

    private updateDisplay() {
        // Clear old entries (keep bg and header)
        const children = this.container.getAll();
        for (let i = children.length - 1; i >= 2; i--) {
            (children[i] as Phaser.GameObjects.GameObject).destroy();
        }

        if (this.entries.length === 0) {
            const placeholder = this.scene.add.text(10, 30, 'No players yet...', {
                fontSize: '11px', color: '#666666'
            });
            this.container.add(placeholder);
            return;
        }

        // Show top 5
        this.entries.slice(0, 5).forEach((entry, i) => {
            const y = 28 + i * 20;
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
            const isYou = entry.name === 'YOU';

            const text = this.scene.add.text(10, y,
                `${medal} ${entry.emoji} ${entry.name.slice(0, 8)} - ${entry.coins}💰`, {
                fontSize: '11px', fontFamily: 'Arial',
                color: isYou ? '#00ff00' : '#ffffff'
            });
            this.container.add(text);
        });
    }

    toggle() {
        this.isVisible = !this.isVisible;
        this.container.setVisible(this.isVisible);
    }
}
