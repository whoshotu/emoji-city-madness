export type Position = { x: number; y: number };
export type EmojiMessage = { text: string; timestamp: number };
import { persistence } from './persistence';

export interface Player {
    id: string;
    position: Position;
    avatar: {
        emoji: string; // Base avatar emoji
        color: string;
    };
    lastMessage?: EmojiMessage;
    score: number;
    isIt: boolean;
    coins: number;
    inventory: string[];
}

export class GameState {
    players: Map<string, Player> = new Map();
    // Tag Game State
    currentIt?: string;
    onTag?: (from: string, to: string) => void;

    constructor(onTag?: (from: string, to: string) => void) {
        this.onTag = onTag;
    }

    addPlayer(id: string) {
        const saved = persistence.getUser(id);
        const isFirst = this.players.size === 0;

        this.players.set(id, {
            id,
            position: { x: Math.random() * 800, y: Math.random() * 600 },
            avatar: { emoji: '😀', color: '#' + Math.floor(Math.random() * 16777215).toString(16) },
            score: 0,
            isIt: isFirst, // First player is IT
            coins: saved.coins,
            inventory: saved.inventory
        });
        if (isFirst) this.currentIt = id;

        return this.players.get(id);
    }

    removePlayer(id: string) {
        this.players.delete(id);
    }

    movePlayer(id: string, x: number, y: number) {
        const player = this.players.get(id);
        if (player) {
            player.position = { x, y };

            // Check Tag Collision
            if (player.isIt) {
                for (const [otherId, other] of this.players) {
                    if (otherId === id) continue;
                    const dist = Math.hypot(other.position.x - x, other.position.y - y);
                    if (dist < 40) { // Collision radius
                        this.transferTag(id, otherId);
                    }
                }
            }
        }
    }

    transferTag(fromId: string, toId: string) {
        const from = this.players.get(fromId);
        const to = this.players.get(toId);
        if (from && to && from.isIt) {
            from.isIt = false;
            to.isIt = true;
            this.currentIt = toId;
            // Provide Feedback event
            if (this.onTag) this.onTag(fromId, toId);
        }
    }

    handleChat(id: string, emoji: string) {
        const player = this.players.get(id);
        if (player) {
            player.lastMessage = { text: emoji, timestamp: Date.now() };
        }
    }
}
