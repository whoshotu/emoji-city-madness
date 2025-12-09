import Phaser from 'phaser';

// Sound effect URLs (free, royalty-free sounds)
const SOUND_URLS = {
    walk: 'https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3',
    carStart: 'https://assets.mixkit.co/active_storage/sfx/158/158-preview.mp3',
    carDrive: 'https://assets.mixkit.co/active_storage/sfx/1554/1554-preview.mp3',
    pop: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
    coin: 'https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3',
    levelUp: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
    click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'
};

export class SoundManager {
    private scene: Phaser.Scene;
    private sounds: Map<string, HTMLAudioElement> = new Map();
    private muted: boolean = false;
    private volume: number = 0.5;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.loadSounds();
    }

    private loadSounds() {
        Object.entries(SOUND_URLS).forEach(([key, url]) => {
            const audio = new Audio(url);
            audio.preload = 'auto';
            audio.volume = this.volume;
            this.sounds.set(key, audio);
        });
    }

    play(soundName: string, loop: boolean = false) {
        if (this.muted) return;

        const sound = this.sounds.get(soundName);
        if (sound) {
            sound.currentTime = 0;
            sound.loop = loop;
            sound.volume = this.volume;
            sound.play().catch(() => {
                // Auto-play blocked, ignore
            });
        }
    }

    stop(soundName: string) {
        const sound = this.sounds.get(soundName);
        if (sound) {
            sound.pause();
            sound.currentTime = 0;
            sound.loop = false;
        }
    }

    setVolume(vol: number) {
        this.volume = Math.max(0, Math.min(1, vol));
        this.sounds.forEach(sound => {
            sound.volume = this.volume;
        });
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.muted) {
            this.sounds.forEach(sound => sound.pause());
        }
        return this.muted;
    }

    isMuted(): boolean {
        return this.muted;
    }
}
