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

# Remove devDependencies to reduce image size (optional)
RUN npm prune --production

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]