import { io } from 'socket.io-client';

// Connect to current host / or configured URL
// In dev, vite proxies /socket.io to localhost:3001
export const socket = io(); // Defaults to window.location
