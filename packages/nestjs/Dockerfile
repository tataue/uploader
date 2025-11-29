FROM node:20-slim
WORKDIR /app
COPY package.json ./
RUN yarn
COPY . .
RUN yarn build
RUN yarn install --production
