import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(__dirname, 'db.json');

interface Schema {
    users: {
        [id: string]: {
            coins: number;
            inventory: string[];
        }
    }
}

let db: Schema = { users: {} };

// Load
try {
    if (fs.existsSync(DB_FILE)) {
        db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }
} catch (e) {
    console.error("Failed to load DB", e);
}

export const persistence = {
    getUser: (id: string) => {
        return db.users[id] || { coins: 0, inventory: [] };
    },
    saveUser: (id: string, data: { coins: number, inventory: string[] }) => {
        db.users[id] = data;
        try {
            fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
        } catch (e) { console.error("Save failed", e); }
    }
};
