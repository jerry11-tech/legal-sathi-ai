FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Run Next.js in development mode for easy syncing during development
CMD ["npm", "run", "dev"]
