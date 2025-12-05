"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vite_1 = require("vite");
const plugin_react_1 = __importDefault(require("@vitejs/plugin-react"));
const path_1 = __importDefault(require("path"));
exports.default = (0, vite_1.defineConfig)({
    plugins: [(0, plugin_react_1.default)()],
    root: 'client',
    build: {
        outDir: '../dist/client',
        emptyOutDir: true
    },
    resolve: {
        alias: {
            '@': path_1.default.resolve(__dirname, './client/src')
        }
    },
    server: {
        proxy: {
            '/socket.io': {
                target: 'http://localhost:3001',
                ws: true
            },
            '/api': {
                target: 'http://localhost:3001'
            }
        }
    }
});
