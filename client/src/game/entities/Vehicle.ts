import Phaser from 'phaser';

export class Vehicle extends Phaser.GameObjects.Container {
    private chassis: Phaser.GameObjects.Rectangle;
    private vehicleEmoji: Phaser.GameObjects.Text;
    public vehicleType: 'car' | 'bike' | 'skateboard';
    public isOccupied: boolean = false;
    public driver: any = null;
    private baseSpeed: number = 300;

    constructor(scene: Phaser.Scene, x: number, y: number, type: 'car' | 'bike' | 'skateboard' = 'car') {
        super(scene, x, y);
        this.vehicleType = type;

        if (type === 'car') {
            // Car body
            this.chassis = scene.add.rectangle(0, 0, 60, 32, 0xff0000);
            this.chassis.setStrokeStyle(2, 0x000000);
            this.add(this.chassis);

            // Wheels
            [[-22, -14], [-22, 14], [22, -14], [22, 14]].forEach(([wx, wy]) => {
                const wheel = scene.add.rectangle(wx, wy, 12, 8, 0x222222);
                this.add(wheel);
            });

            // Window
            const window = scene.add.rectangle(15, 0, 20, 16, 0x87ceeb);
            this.add(window);

            this.vehicleEmoji = scene.add.text(-25, 0, '🚗', { fontSize: '20px' }).setOrigin(0.5);
            this.baseSpeed = 350;

        } else if (type === 'bike') {
            this.chassis = scene.add.rectangle(0, 0, 40, 16, 0x00aa00);
            this.chassis.setStrokeStyle(2, 0x000000);
            this.add(this.chassis);

            // Wheels
            this.add(scene.add.circle(-15, 8, 8, 0x222222));
            this.add(scene.add.circle(15, 8, 8, 0x222222));

            this.vehicleEmoji = scene.add.text(0, -15, '🏍️', { fontSize: '18px' }).setOrigin(0.5);
            this.baseSpeed = 280;

        } else {
            // Skateboard
            this.chassis = scene.add.rectangle(0, 0, 32, 10, 0x8b4513);
            this.chassis.setStrokeStyle(1, 0x000000);
            this.add(this.chassis);

            this.add(scene.add.circle(-10, 6, 4, 0x222222));
            this.add(scene.add.circle(10, 6, 4, 0x222222));

            this.vehicleEmoji = scene.add.text(0, -12, '🛹', { fontSize: '14px' }).setOrigin(0.5);
            this.baseSpeed = 200;
        }

        this.add(this.vehicleEmoji);

        // "Press E" prompt
        const prompt = scene.add.text(0, -35, '[E] Enter', {
            fontSize: '11px',
            color: '#ffff00',
            backgroundColor: '#000000cc',
            padding: { x: 4, y: 2 }
        }).setOrigin(0.5).setVisible(false);
        this.add(prompt);
        this.setData('prompt', prompt);

        scene.add.existing(this);
    }

    showPrompt(visible: boolean) {
        (this.getData('prompt') as Phaser.GameObjects.Text)?.setVisible(visible);
    }

    enter(player: any) {
        this.isOccupied = true;
        this.driver = player;
        player.setVisible(false);
        this.showPrompt(false);
    }

    exit(): { x: number, y: number } {
        this.isOccupied = false;
        const exitPos = { x: this.x + 50, y: this.y };
        if (this.driver) {
            this.driver.setVisible(true);
            this.driver.setPosition(exitPos.x, exitPos.y);
        }
        this.driver = null;
        return exitPos;
    }

    getSpeed(): number {
        return this.baseSpeed;
    }
}
