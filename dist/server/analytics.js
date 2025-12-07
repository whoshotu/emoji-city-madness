"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analytics = void 0;
exports.analytics = {
    track: (event, userId, properties) => {
        console.log(`[Analytics] ${event} User:${userId}`, properties);
    }
};
