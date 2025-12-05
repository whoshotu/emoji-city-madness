"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socket = void 0;
const socket_io_client_1 = require("socket.io-client");
// Connect to current host / or configured URL
// In dev, vite proxies /socket.io to localhost:3001
exports.socket = (0, socket_io_client_1.io)(); // Defaults to window.location
