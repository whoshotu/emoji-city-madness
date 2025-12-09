import Phaser from 'phaser';

export class Player extends Phaser.GameObjects.Container {
    private body_rect: Phaser.GameObjects.Rectangle;
    private head_rect: Phaser.GameObjects.Rectangle;
    private leftLeg: Phaser.GameObjects.Rectangle;
    private rightLeg: Phaser.GameObjects.Rectangle;
    private emoji_text: Phaser.GameObjects.Text;
    private name_text: Phaser.GameObjects.Text;
    private shadow: Phaser.GameObjects.Ellipse;
    public playerId: string;

    // Animation state
    private isWalking: boolean = false;
    private walkTween: Phaser.Tweens.Tween | null = null;
    private bounceTween: Phaser.Tweens.Tween | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number, playerId: string, emoji: string = '😀', color: number = 0xff6600) {
        super(scene, x, y);
        this.playerId = playerId;

        // Shadow under character
        this.shadow = scene.add.ellipse(0, 38, 30, 10, 0x000000, 0.3);
        this.add(this.shadow);

        // LEGO-style blocky body (torso)
        this.body_rect = scene.add.rectangle(0, 8, 24, 28, color);
        this.body_rect.setStrokeStyle(2, 0x000000);
        this.add(this.body_rect);

        // Legs (separate for animation)
        this.leftLeg = scene.add.rectangle(-6, 28, 10, 16, color);
        this.leftLeg.setStrokeStyle(2, 0x000000);
        this.add(this.leftLeg);

        this.rightLeg = scene.add.rectangle(6, 28, 10, 16, color);
        this.rightLeg.setStrokeStyle(2, 0x000000);
        this.add(this.rightLeg);

        // Head (yellow like LEGO)
        this.head_rect = scene.add.rectangle(0, -14, 20, 20, 0xffcc00);
        this.head_rect.setStrokeStyle(2, 0x000000);
        this.add(this.head_rect);

        // Emoji face on head
        this.emoji_text = scene.add.text(0, -14, emoji, {
            fontSize: '16px'
        }).setOrigin(0.5);
        this.add(this.emoji_text);

        // Player name tag with better styling
        this.name_text = scene.add.text(0, -40, playerId.slice(0, 6), {
            fontSize: '11px',
            fontFamily: 'Arial',
            color: '#ffffff',
            backgroundColor: '#000000cc',
            padding: { x: 6, y: 3 }
        }).setOrigin(0.5);
        this.add(this.name_text);

        scene.add.existing(this);
    }

    startWalking() {
        if (this.isWalking) return;
        this.isWalking = true;

        // Leg swing animation
        this.walkTween = this.scene.tweens.add({
            targets: [this.leftLeg, this.rightLeg],
            x: {
                getStart: (target: any) => target === this.leftLeg ? -6 : 6,
                getEnd: (target: any) => target === this.leftLeg ? -2 : 2
            },
            yoyo: true,
            repeat: -1,
            duration: 100,
            ease: 'Sine.easeInOut'
        });

        // Body bounce
        this.bounceTween = this.scene.tweens.add({
            targets: [this.body_rect, this.head_rect, this.emoji_text],
            y: '-=2',
            yoyo: true,
            repeat: -1,
            duration: 100,
            ease: 'Sine.easeInOut'
        });
    }

    stopWalking() {
        if (!this.isWalking) return;
        this.isWalking = false;

        // Stop tweens
        if (this.walkTween) {
            this.walkTween.stop();
            this.walkTween = null;
        }
        if (this.bounceTween) {
            this.bounceTween.stop();
            this.bounceTween = null;
        }

        // Reset positions
        this.leftLeg.x = -6;
        this.rightLeg.x = 6;
        this.body_rect.y = 8;
        this.head_rect.y = -14;
        this.emoji_text.y = -14;
    }

    setEmoji(emoji: string) {
        this.emoji_text.setText(emoji);
    }

    setBodyColor(color: number) {
        this.body_rect.setFillStyle(color);
        this.leftLeg.setFillStyle(color);
        this.rightLeg.setFillStyle(color);
    }

    showChatBubble(emoji: string, duration: number = 3000) {
        // Animated chat bubble
        const bubble = this.scene.add.container(0, -60);

        const bg = this.scene.add.rectangle(0, 0, 50, 50, 0xffffff, 0.95);
        bg.setStrokeStyle(2, 0x333333);
        bubble.add(bg);

        const text = this.scene.add.text(0, 0, emoji, {
            fontSize: '28px'
        }).setOrigin(0.5);
        bubble.add(text);

        this.add(bubble);

        // Pop-in animation
        bubble.setScale(0);
        this.scene.tweens.add({
            targets: bubble,
            scale: 1,
            duration: 200,
            ease: 'Back.easeOut'
        });

        // Float and fade out
        this.scene.tweens.add({
            targets: bubble,
            y: -80,
            alpha: 0,
            delay: duration - 500,
            duration: 500,
            ease: 'Quad.easeOut',
            onComplete: () => bubble.destroy()
        });
    }

    // Squash and stretch on landing
    squash() {
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.2,
            scaleY: 0.8,
            duration: 50,
            yoyo: true,
            ease: 'Quad.easeOut'
        });
    }
}
