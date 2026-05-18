FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Create non-root user
RUN addgroup -S codeforge && adduser -S codeforge -G codeforge
USER codeforge

EXPOSE 5000

CMD ["node", "server.js"]
