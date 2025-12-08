import Phaser from 'phaser';

export class Player extends Phaser.GameObjects.Container {
    private body_rect: Phaser.GameObjects.Rectangle;
    private head_rect: Phaser.GameObjects.Rectangle;
    private emoji_text: Phaser.GameObjects.Text;
    private name_text: Phaser.GameObjects.Text;
    private speed: number = 200;
    public playerId: string;

    constructor(scene: Phaser.Scene, x: number, y: number, playerId: string, emoji: string = '😀', color: number = 0xff6600) {
        super(scene, x, y);
        this.playerId = playerId;

        // LEGO-style blocky body (torso)
        this.body_rect = scene.add.rectangle(0, 8, 24, 28, color);
        this.body_rect.setStrokeStyle(2, 0x000000);
        this.add(this.body_rect);

        // Legs
        const leftLeg = scene.add.rectangle(-6, 28, 10, 16, color);
        leftLeg.setStrokeStyle(2, 0x000000);
        this.add(leftLeg);

        const rightLeg = scene.add.rectangle(6, 28, 10, 16, color);
        rightLeg.setStrokeStyle(2, 0x000000);
        this.add(rightLeg);

        // Head (yellow like LEGO)
        this.head_rect = scene.add.rectangle(0, -14, 20, 20, 0xffcc00);
        this.head_rect.setStrokeStyle(2, 0x000000);
        this.add(this.head_rect);

        // Emoji face on head
        this.emoji_text = scene.add.text(0, -14, emoji, {
            fontSize: '16px'
        }).setOrigin(0.5);
        this.add(this.emoji_text);

        // Player name tag
        this.name_text = scene.add.text(0, -35, playerId.slice(0, 6), {
            fontSize: '10px',
            color: '#ffffff',
            backgroundColor: '#000000aa',
            padding: { x: 4, y: 2 }
        }).setOrigin(0.5);
        this.add(this.name_text);

        scene.add.existing(this);
    }

    setEmoji(emoji: string) {
        this.emoji_text.setText(emoji);
    }

    setBodyColor(color: number) {
        this.body_rect.setFillStyle(color);
    }

    showChatBubble(emoji: string, duration: number = 3000) {
        const bubble = this.scene.add.text(0, -55, emoji, {
            fontSize: '32px',
            backgroundColor: '#ffffffee',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5);
        this.add(bubble);

        this.scene.time.delayedCall(duration, () => {
            bubble.destroy();
        });
    }
}
