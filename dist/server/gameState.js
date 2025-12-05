"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameState = void 0;
const persistence_1 = require("./persistence");
class GameState {
    constructor(onTag) {
        Object.defineProperty(this, "players", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        // Tag Game State
        Object.defineProperty(this, "currentIt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "onTag", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.onTag = onTag;
    }
    addPlayer(id) {
        const saved = persistence_1.persistence.getUser(id);
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
        if (isFirst)
            this.currentIt = id;
        return this.players.get(id);
    }
    removePlayer(id) {
        this.players.delete(id);
    }
    movePlayer(id, x, y) {
        const player = this.players.get(id);
        if (player) {
            player.position = { x, y };
            // Check Tag Collision
            if (player.isIt) {
                for (const [otherId, other] of this.players) {
                    if (otherId === id)
                        continue;
                    const dist = Math.hypot(other.position.x - x, other.position.y - y);
                    if (dist < 40) { // Collision radius
                        this.transferTag(id, otherId);
                    }
                }
            }
        }
    }
    transferTag(fromId, toId) {
        const from = this.players.get(fromId);
        const to = this.players.get(toId);
        if (from && to && from.isIt) {
            from.isIt = false;
            to.isIt = true;
            this.currentIt = toId;
            // Provide Feedback event
            if (this.onTag)
                this.onTag(fromId, toId);
        }
    }
    handleChat(id, emoji) {
        const player = this.players.get(id);
        if (player) {
            player.lastMessage = { text: emoji, timestamp: Date.now() };
        }
    }
}
exports.GameState = GameState;
