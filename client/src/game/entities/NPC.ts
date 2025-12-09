import Phaser from 'phaser';

export class NPC extends Phaser.GameObjects.Container {
    private body_rect: Phaser.GameObjects.Rectangle;
    private head_rect: Phaser.GameObjects.Rectangle;
    private emoji_text: Phaser.GameObjects.Text;
    private dialogueBubble: Phaser.GameObjects.Container | null = null;
    public npcName: string;
    private moveTimer: Phaser.Time.TimerEvent | null = null;
    private dialogues: string[];

    // Brainrot NPC dialogues
    private static DIALOGUE_OPTIONS = [
        ['🗣️ Skibidi!', '💀 No cap fr fr', '🔥 This city bussin'],
        ['👀 Ayo?!', '💯 Real talk', '🤯 Mind blown rn'],
        ['🥶 Ice cold', '😤 Lowkey sus', '🎭 Main character'],
        ['🧠 Brain rot mode', '✨ Slay queen', '🚀 To the moon'],
        ['👑 King behavior', '💅 Period.', '🤡 Clown moment'],
    ];

    constructor(scene: Phaser.Scene, x: number, y: number, name: string, emoji: string = '🤖', color: number = 0x888888) {
        super(scene, x, y);
        this.npcName = name;
        this.dialogues = NPC.DIALOGUE_OPTIONS[Math.floor(Math.random() * NPC.DIALOGUE_OPTIONS.length)];

        // Shadow
        scene.add.ellipse(0, 38, 25, 8, 0x000000, 0.2);
        this.add(scene.add.ellipse(0, 38, 25, 8, 0x000000, 0.2));

        // Body
        this.body_rect = scene.add.rectangle(0, 8, 20, 24, color);
        this.body_rect.setStrokeStyle(2, 0x000000);
        this.add(this.body_rect);

        // Legs
        this.add(scene.add.rectangle(-4, 26, 8, 14, color).setStrokeStyle(1, 0x000000));
        this.add(scene.add.rectangle(4, 26, 8, 14, color).setStrokeStyle(1, 0x000000));

        // Head
        this.head_rect = scene.add.rectangle(0, -10, 16, 16, 0xffcc00);
        this.head_rect.setStrokeStyle(2, 0x000000);
        this.add(this.head_rect);

        // Emoji
        this.emoji_text = scene.add.text(0, -10, emoji, { fontSize: '12px' }).setOrigin(0.5);
        this.add(this.emoji_text);

        // Name tag
        const nameTag = scene.add.text(0, -30, name, {
            fontSize: '9px', fontFamily: 'Arial', color: '#ffff00',
            backgroundColor: '#000000aa', padding: { x: 4, y: 2 }
        }).setOrigin(0.5);
        this.add(nameTag);

        scene.add.existing(this);
        this.startWandering();
    }

    private startWandering() {
        // Random movement every 2-5 seconds
        this.moveTimer = this.scene.time.addEvent({
            delay: Phaser.Math.Between(2000, 5000),
            callback: this.wander,
            callbackScope: this,
            loop: true
        });

        // Random dialogue every 8-15 seconds
        this.scene.time.addEvent({
            delay: Phaser.Math.Between(8000, 15000),
            callback: this.sayRandomDialogue,
            callbackScope: this,
            loop: true
        });
    }

    private wander() {
        const newX = this.x + Phaser.Math.Between(-50, 50);
        const newY = this.y + Phaser.Math.Between(-50, 50);

        // Clamp to world bounds
        const clampedX = Phaser.Math.Clamp(newX, 50, 1200);
        const clampedY = Phaser.Math.Clamp(newY, 50, 900);

        this.scene.tweens.add({
            targets: this,
            x: clampedX,
            y: clampedY,
            duration: 1000,
            ease: 'Sine.easeInOut'
        });
    }

    private sayRandomDialogue() {
        if (this.dialogueBubble) return;

        const text = this.dialogues[Math.floor(Math.random() * this.dialogues.length)];

        this.dialogueBubble = this.scene.add.container(0, -50);

        const bg = this.scene.add.rectangle(0, 0, text.length * 8 + 20, 30, 0xffffff, 0.95);
        bg.setStrokeStyle(2, 0x333333);
        this.dialogueBubble.add(bg);

        const dialogueText = this.scene.add.text(0, 0, text, {
            fontSize: '12px', fontFamily: 'Arial', color: '#000000'
        }).setOrigin(0.5);
        this.dialogueBubble.add(dialogueText);

        this.add(this.dialogueBubble);

        // Pop animation
        this.dialogueBubble.setScale(0);
        this.scene.tweens.add({
            targets: this.dialogueBubble,
            scale: 1,
            duration: 200,
            ease: 'Back.easeOut'
        });

        // Remove after delay
        this.scene.time.delayedCall(3000, () => {
            if (this.dialogueBubble) {
                this.dialogueBubble.destroy();
                this.dialogueBubble = null;
            }
        });
    }

    destroy() {
        if (this.moveTimer) this.moveTimer.destroy();
        super.destroy();
    }
}
