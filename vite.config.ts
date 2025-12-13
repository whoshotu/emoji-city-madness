import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    root: 'client',
    build: {
        outDir: '../dist/client',
        emptyOutDir: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    'phaser': ['phaser'],
                    'vendor': ['react', 'react-dom', 'socket.io-client']
                }
            }
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './client/src')
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
