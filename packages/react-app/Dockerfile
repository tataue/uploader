FROM node:latest AS build
WORKDIR /app
COPY ./package.json ./yarn.lock ./
RUN yarn install --registry https://registry.npm.taobao.org
COPY . .
RUN yarn build
RUN echo "nestapp-front build end"

FROM alpine
WORKDIR /app
COPY --from=build /app/build  .
