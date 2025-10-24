# Backend build stage
FROM node:24-alpine AS build
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN mkdir -p packages/nestjs packages/react-app
COPY packages/nestjs/package.json ./packages/nestjs/
COPY packages/react-app/package.json ./packages/react-app/

# Install ALL dependencies (including dev dependencies for building)
RUN pnpm install

# Copy source code
COPY . .

# Build the project
RUN pnpm run -r build


RUN mkdir -p /app/deploy
# Configure npm to prefer local cache and avoid unnecessary network requests
RUN pnpm config set prefer-offline true
RUN pnpm config set cache-min 86400
RUN pnpm --filter=nestjs --prod deploy /app/deploy --legacy






# Final runtime stage
FROM node:24-alpine
WORKDIR /app

# Copy built application
COPY --from=build /app/packages/nestjs/dist ./server

# Copy deployed dependencies (real files, no symlinks)
COPY --from=build /app/deploy ./server/


COPY --from=build /app/packages/react-app/build ./client

CMD ["node", "server/main.js"]


