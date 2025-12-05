"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.persistence = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DB_FILE = path_1.default.join(__dirname, 'db.json');
let db = { users: {} };
// Load
try {
    if (fs_1.default.existsSync(DB_FILE)) {
        db = JSON.parse(fs_1.default.readFileSync(DB_FILE, 'utf-8'));
    }
}
catch (e) {
    console.error("Failed to load DB", e);
}
exports.persistence = {
    getUser: (id) => {
        return db.users[id] || { coins: 0, inventory: [] };
    },
    saveUser: (id, data) => {
        db.users[id] = data;
        try {
            fs_1.default.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
        }
        catch (e) {
            console.error("Save failed", e);
        }
    }
};
