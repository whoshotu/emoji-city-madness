import Phaser from 'phaser';

export interface Mission {
    id: string;
    title: string;
    description: string;
    type: 'collect' | 'travel' | 'tag' | 'race' | 'social';
    target: number;
    progress: number;
    reward: { coins: number, xp: number };
    completed: boolean;
    emoji: string;
}

export class MissionSystem {
    private scene: Phaser.Scene;
    private missions: Mission[] = [];
    private activeMission: Mission | null = null;
    private missionUI: Phaser.GameObjects.Container | null = null;
    private onMissionComplete?: (mission: Mission) => void;

    private missionTemplates: Omit<Mission, 'progress' | 'completed'>[] = [
        { id: 'collect_10', title: 'Coin Collector', description: 'Collect 10 coins', type: 'collect', target: 10, reward: { coins: 50, xp: 25 }, emoji: '💰' },
        { id: 'collect_25', title: 'Money Bags', description: 'Collect 25 coins', type: 'collect', target: 25, reward: { coins: 100, xp: 50 }, emoji: '💎' },
        { id: 'travel_beach', title: 'Beach Bum', description: 'Visit the beach', type: 'travel', target: 1, reward: { coins: 30, xp: 15 }, emoji: '🏖️' },
        { id: 'travel_park', title: 'Nature Walk', description: 'Visit the park', type: 'travel', target: 1, reward: { coins: 30, xp: 15 }, emoji: '🌳' },
        { id: 'drive_car', title: 'Road Tripper', description: 'Drive a car', type: 'travel', target: 1, reward: { coins: 40, xp: 20 }, emoji: '🚗' },
        { id: 'chat_5', title: 'Social Butterfly', description: 'Send 5 emojis', type: 'social', target: 5, reward: { coins: 25, xp: 20 }, emoji: '💬' },
        { id: 'collect_gem', title: 'Gem Hunter', description: 'Find a gem', type: 'collect', target: 1, reward: { coins: 75, xp: 40 }, emoji: '💎' },
    ];

    constructor(scene: Phaser.Scene, onComplete?: (mission: Mission) => void) {
        this.scene = scene;
        this.onMissionComplete = onComplete;
        this.generateMissions();
        this.createUI();
    }

    private generateMissions() {
        // Select 3 random missions
        const shuffled = [...this.missionTemplates].sort(() => Math.random() - 0.5);
        this.missions = shuffled.slice(0, 3).map(t => ({
            ...t,
            progress: 0,
            completed: false
        }));
        this.activeMission = this.missions[0];
    }

    private createUI() {
        this.missionUI = this.scene.add.container(10, 120).setScrollFactor(0).setDepth(100);

        // Background panel
        const bg = this.scene.add.rectangle(0, 0, 220, 80, 0x000000, 0.8);
        bg.setOrigin(0, 0);
        bg.setStrokeStyle(2, 0xffff00);
        this.missionUI.add(bg);

        // Header
        const header = this.scene.add.text(10, 8, '📋 MISSION', {
            fontSize: '12px', fontFamily: 'Arial', color: '#ffff00'
        });
        this.missionUI.add(header);

        this.updateUI();
    }

    private updateUI() {
        if (!this.missionUI || !this.activeMission) return;

        // Clear old text (except bg and header)
        const children = this.missionUI.getAll();
        for (let i = children.length - 1; i >= 2; i--) {
            (children[i] as Phaser.GameObjects.GameObject).destroy();
        }

        const m = this.activeMission;

        // Mission title
        const title = this.scene.add.text(10, 28, `${m.emoji} ${m.title}`, {
            fontSize: '14px', fontFamily: 'Arial', color: '#ffffff'
        });
        this.missionUI!.add(title);

        // Description & progress
        const progressText = m.completed ? '✅ COMPLETE!' : `${m.progress}/${m.target}`;
        const desc = this.scene.add.text(10, 48, `${m.description} (${progressText})`, {
            fontSize: '11px', fontFamily: 'Arial', color: m.completed ? '#00ff00' : '#aaaaaa'
        });
        this.missionUI!.add(desc);

        // Reward
        const reward = this.scene.add.text(10, 65, `Reward: +${m.reward.coins}💰 +${m.reward.xp}XP`, {
            fontSize: '10px', fontFamily: 'Arial', color: '#ffaa00'
        });
        this.missionUI!.add(reward);
    }

    addProgress(type: 'collect' | 'travel' | 'tag' | 'race' | 'social', amount: number = 1) {
        for (const mission of this.missions) {
            if (mission.type === type && !mission.completed) {
                mission.progress = Math.min(mission.progress + amount, mission.target);
                if (mission.progress >= mission.target) {
                    this.completeMission(mission);
                }
            }
        }
        this.updateUI();
    }

    checkZone(zone: string) {
        if (zone === 'beach') this.addProgress('travel');
        if (zone === 'park') this.addProgress('travel');
    }

    private completeMission(mission: Mission) {
        mission.completed = true;

        // Show completion popup
        this.showCompletionPopup(mission);

        // Callback
        if (this.onMissionComplete) {
            this.onMissionComplete(mission);
        }

        // Move to next mission
        const nextMission = this.missions.find(m => !m.completed);
        if (nextMission) {
            this.activeMission = nextMission;
        }

        this.updateUI();
    }

    private showCompletionPopup(mission: Mission) {
        const popup = this.scene.add.container(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2
        ).setScrollFactor(0).setDepth(2000);

        const bg = this.scene.add.rectangle(0, 0, 350, 150, 0x000000, 0.95);
        bg.setStrokeStyle(3, 0x00ff00);
        popup.add(bg);

        popup.add(this.scene.add.text(0, -40, '🎉 MISSION COMPLETE!', {
            fontSize: '24px', fontFamily: 'Arial Black', color: '#00ff00'
        }).setOrigin(0.5));

        popup.add(this.scene.add.text(0, 0, `${mission.emoji} ${mission.title}`, {
            fontSize: '18px', fontFamily: 'Arial', color: '#ffffff'
        }).setOrigin(0.5));

        popup.add(this.scene.add.text(0, 35, `+${mission.reward.coins}💰  +${mission.reward.xp}XP`, {
            fontSize: '20px', fontFamily: 'Arial', color: '#ffff00'
        }).setOrigin(0.5));

        // Animate
        popup.setScale(0);
        this.scene.tweens.add({
            targets: popup,
            scale: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });

        this.scene.tweens.add({
            targets: popup,
            alpha: 0,
            delay: 3000,
            duration: 500,
            onComplete: () => popup.destroy()
        });
    }

    getActiveMission(): Mission | null {
        return this.activeMission;
    }
}
