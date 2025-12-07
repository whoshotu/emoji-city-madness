FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy source code (excluding node_modules and dist per .dockerignore)
COPY . .

# Build client and server
RUN npm run build

# Set environment
ENV NODE_ENV=production

# Don't hardcode PORT - Render sets it dynamically
EXPOSE 3000

CMD ["npm", "start"]