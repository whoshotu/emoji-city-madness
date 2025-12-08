import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Title
        const title = this.add.text(width / 2, height / 3, 'EMOJI CITY MMO', {
            fontSize: '64px',
            fontFamily: 'Arial Black',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 8
        });
        title.setOrigin(0.5);

        // Subtitle (brainrot flavor)
        const subtitle = this.add.text(width / 2, height / 3 + 80, 'where the vibes are immaculate 💯', {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: '#ffffff'
        });
        subtitle.setOrigin(0.5);

        // Play button
        const playButton = this.add.text(width / 2, height / 2 + 100, '▶ PLAY NOW', {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#00ff00',
            backgroundColor: '#222222',
            padding: { x: 20, y: 10 }
        });
        playButton.setOrigin(0.5);
        playButton.setInteractive({ useHandCursor: true });

        // Hover effect
        playButton.on('pointerover', () => {
            playButton.setScale(1.1);
        });
        playButton.on('pointerout', () => {
            playButton.setScale(1);
        });

        // Click to start game
        playButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        // Version info
        this.add.text(10, height - 30, 'v0.1.0 Alpha', {
            fontSize: '16px',
            color: '#666666'
        });
    }
}
