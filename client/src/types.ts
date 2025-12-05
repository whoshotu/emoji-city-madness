export type Position = { x: number; y: number };
export type EmojiMessage = { text: string; timestamp: number };

export interface Player {
    id: string;
    position: Position;
    avatar: {
        emoji: string;
        color: string;
    };
    lastMessage?: EmojiMessage;
    score: number;
    isIt?: boolean; // Optional bc maybe not synced initially
    coins: number;
}
