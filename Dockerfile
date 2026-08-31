# 1. Use Node 20 to satisfy Firebase requirements
FROM node:20-alpine

WORKDIR /app

# 2. Install bash
RUN apk add --no-cache bash

# 3. Copy package files
COPY package*.json ./

# 4. Fix network timeouts for npm
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# 5. INSTALL: Added --legacy-peer-deps for Alan AI
RUN npm install --legacy-peer-deps --network-timeout=1000000

# 6. PRE-INSTALL NGROK: This prevents the 'CommandError: Input is required'
RUN npm install -g @expo/ngrok@^4.1.0

# 7. Install Expo CLI globally
RUN npm install -g expo-cli

COPY . .

# Expose Metro ports
EXPOSE 8081 19000 19001

# Start with tunnel
CMD ["npx", "expo", "start", "--tunnel"]