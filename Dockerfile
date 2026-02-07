# ./Dockerfile (Backend)
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# CHANGE 1: Match your port
EXPOSE 8001

# CHANGE 2: Use your dev command
CMD ["npm", "run", "dev"]