export const analytics = {
    track: (event: string, userId: string, properties?: any) => {
        console.log(`[Analytics] ${event} User:${userId}`, properties);
    }
};
