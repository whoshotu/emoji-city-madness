FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build client and server
RUN npm run build

# Expose port (Cloud Run sets PORT env, default 3000)
ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
