# client/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# IMPORTANT: --host is required for Docker to see the frontend
CMD ["npm", "run", "dev", "--", "--host"]