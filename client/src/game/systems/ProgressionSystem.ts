import Phaser from 'phaser';

export interface PlayerProgress {
    coins: number;
    gems: number;
    xp: number;
    level: number;
    unlockedEmojis: string[];
    unlockedColors: number[];
    dailyLoginStreak: number;
    lastLogin: string;
}

export interface StoreItem {
    id: string;
    type: 'emoji' | 'color' | 'vehicle_skin';
    name: string;
    price: number;
    currency: 'coins' | 'gems';
    value: string | number;
}

export class ProgressionSystem {
    private scene: Phaser.Scene;
    private progress: PlayerProgress;
    private uiContainer: Phaser.GameObjects.Container | null = null;

    // XP required per level (increases each level)
    private xpTable: number[] = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000];

    // Default emojis everyone starts with
    private defaultEmojis = ['😀', '😎', '🤠'];
    private defaultColors = [0xff6600, 0x00aaff, 0x00ff00];

    // Store catalog
    private storeItems: StoreItem[] = [
        { id: 'emoji_1', type: 'emoji', name: 'Cool 😎', price: 100, currency: 'coins', value: '😎' },
        { id: 'emoji_2', type: 'emoji', name: 'Fire 🔥', price: 150, currency: 'coins', value: '🔥' },
        { id: 'emoji_3', type: 'emoji', name: 'Skull 💀', price: 200, currency: 'coins', value: '💀' },
        { id: 'emoji_4', type: 'emoji', name: 'Alien 👽', price: 300, currency: 'coins', value: '👽' },
        { id: 'emoji_5', type: 'emoji', name: 'Robot 🤖', price: 250, currency: 'coins', value: '🤖' },
        { id: 'emoji_6', type: 'emoji', name: 'Ghost 👻', price: 200, currency: 'coins', value: '👻' },
        { id: 'emoji_7', type: 'emoji', name: 'Devil 😈', price: 500, currency: 'gems', value: '😈' },
        { id: 'emoji_8', type: 'emoji', name: 'Crown 👑', price: 1000, currency: 'gems', value: '👑' },
        { id: 'color_1', type: 'color', name: 'Purple', price: 200, currency: 'coins', value: 0x9900ff },
        { id: 'color_2', type: 'color', name: 'Gold', price: 500, currency: 'coins', value: 0xffd700 },
        { id: 'color_3', type: 'color', name: 'Rainbow', price: 100, currency: 'gems', value: 0xff00ff },
    ];

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.progress = this.loadProgress();
    }

    private loadProgress(): PlayerProgress {
        const saved = localStorage.getItem('emojiCityProgress');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            coins: 100, // Starting coins
            gems: 5,    // Starting gems
            xp: 0,
            level: 1,
            unlockedEmojis: [...this.defaultEmojis],
            unlockedColors: [...this.defaultColors],
            dailyLoginStreak: 1,
            lastLogin: new Date().toISOString().split('T')[0]
        };
    }

    private saveProgress() {
        localStorage.setItem('emojiCityProgress', JSON.stringify(this.progress));
    }

    // Currency
    addCoins(amount: number) {
        this.progress.coins += amount;
        this.saveProgress();
        this.showReward(`+${amount} 💰`);
    }

    addGems(amount: number) {
        this.progress.gems += amount;
        this.saveProgress();
        this.showReward(`+${amount} 💎`);
    }

    getCoins(): number { return this.progress.coins; }
    getGems(): number { return this.progress.gems; }

    // XP & Leveling
    addXP(amount: number) {
        this.progress.xp += amount;
        this.showReward(`+${amount} XP`);

        // Check for level up
        while (this.progress.level < this.xpTable.length - 1 &&
            this.progress.xp >= this.xpTable[this.progress.level]) {
            this.progress.xp -= this.xpTable[this.progress.level];
            this.progress.level++;
            this.onLevelUp();
        }
        this.saveProgress();
    }

    private onLevelUp() {
        // Reward coins on level up
        const reward = this.progress.level * 50;
        this.progress.coins += reward;

        this.showAnnouncement(
            `🎉 LEVEL UP!`,
            `Level ${this.progress.level} | +${reward} coins`
        );
    }

    getLevel(): number { return this.progress.level; }
    getXP(): number { return this.progress.xp; }
    getXPForNextLevel(): number { return this.xpTable[this.progress.level] || 99999; }

    // Store
    getStoreItems(): StoreItem[] { return this.storeItems; }

    canAfford(item: StoreItem): boolean {
        if (item.currency === 'coins') return this.progress.coins >= item.price;
        return this.progress.gems >= item.price;
    }

    purchase(item: StoreItem): boolean {
        if (!this.canAfford(item)) return false;

        // Deduct currency
        if (item.currency === 'coins') this.progress.coins -= item.price;
        else this.progress.gems -= item.price;

        // Unlock item
        if (item.type === 'emoji') {
            this.progress.unlockedEmojis.push(item.value as string);
        } else if (item.type === 'color') {
            this.progress.unlockedColors.push(item.value as number);
        }

        this.saveProgress();
        this.showReward(`Unlocked ${item.name}!`);
        return true;
    }

    isUnlocked(itemId: string): boolean {
        const item = this.storeItems.find(i => i.id === itemId);
        if (!item) return false;
        if (item.type === 'emoji') return this.progress.unlockedEmojis.includes(item.value as string);
        if (item.type === 'color') return this.progress.unlockedColors.includes(item.value as number);
        return false;
    }

    getUnlockedEmojis(): string[] { return this.progress.unlockedEmojis; }
    getUnlockedColors(): number[] { return this.progress.unlockedColors; }

    // Daily login
    checkDailyLogin() {
        const today = new Date().toISOString().split('T')[0];
        if (this.progress.lastLogin !== today) {
            // Yesterday?
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            if (this.progress.lastLogin === yesterday) {
                this.progress.dailyLoginStreak++;
            } else {
                this.progress.dailyLoginStreak = 1;
            }
            this.progress.lastLogin = today;

            // Daily reward (increases with streak)
            const reward = Math.min(this.progress.dailyLoginStreak * 25, 250);
            this.addCoins(reward);
            this.showAnnouncement(
                `📅 Daily Bonus!`,
                `Streak: ${this.progress.dailyLoginStreak} days | +${reward} coins`
            );
            this.saveProgress();
        }
    }

    // UI Helpers
    private showReward(text: string) {
        const reward = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            100,
            text,
            { fontSize: '24px', color: '#ffff00', backgroundColor: '#000000aa', padding: { x: 10, y: 5 } }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(2000);

        this.scene.tweens.add({
            targets: reward,
            y: 60,
            alpha: 0,
            duration: 1500,
            onComplete: () => reward.destroy()
        });
    }

    private showAnnouncement(title: string, subtitle: string) {
        const container = this.scene.add.container(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2
        ).setScrollFactor(0).setDepth(2000);

        container.add(this.scene.add.rectangle(0, 0, 400, 120, 0x000000, 0.9));
        container.add(this.scene.add.text(0, -25, title, { fontSize: '28px', color: '#ffff00' }).setOrigin(0.5));
        container.add(this.scene.add.text(0, 20, subtitle, { fontSize: '18px', color: '#ffffff' }).setOrigin(0.5));

        this.scene.tweens.add({
            targets: container,
            alpha: 0,
            delay: 3000,
            duration: 500,
            onComplete: () => container.destroy()
        });
    }

    // HUD Display
    createHUD(): Phaser.GameObjects.Container {
        this.uiContainer = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(500);

        // Currency display (top right)
        const coinText = this.scene.add.text(
            this.scene.cameras.main.width - 120, 10,
            `💰 ${this.progress.coins}`,
            { fontSize: '18px', color: '#ffff00', backgroundColor: '#000000cc', padding: { x: 8, y: 4 } }
        );
        const gemText = this.scene.add.text(
            this.scene.cameras.main.width - 120, 40,
            `💎 ${this.progress.gems}`,
            { fontSize: '18px', color: '#00ffff', backgroundColor: '#000000cc', padding: { x: 8, y: 4 } }
        );

        // Level & XP
        const levelText = this.scene.add.text(
            this.scene.cameras.main.width - 120, 70,
            `Lv.${this.progress.level} | XP: ${this.progress.xp}/${this.getXPForNextLevel()}`,
            { fontSize: '12px', color: '#ffffff', backgroundColor: '#000000cc', padding: { x: 8, y: 4 } }
        );

        this.uiContainer.add([coinText, gemText, levelText]);
        this.uiContainer.setData('coinText', coinText);
        this.uiContainer.setData('gemText', gemText);
        this.uiContainer.setData('levelText', levelText);

        return this.uiContainer;
    }

    updateHUD() {
        if (!this.uiContainer) return;
        const coinText = this.uiContainer.getData('coinText') as Phaser.GameObjects.Text;
        const gemText = this.uiContainer.getData('gemText') as Phaser.GameObjects.Text;
        const levelText = this.uiContainer.getData('levelText') as Phaser.GameObjects.Text;

        if (coinText) coinText.setText(`💰 ${this.progress.coins}`);
        if (gemText) gemText.setText(`💎 ${this.progress.gems}`);
        if (levelText) levelText.setText(`Lv.${this.progress.level} | XP: ${this.progress.xp}/${this.getXPForNextLevel()}`);
    }
}
