FROM node:latest AS build
WORKDIR /app
COPY ./package.json ./
RUN yarn install --registry https://registry.npm.taobao.org
COPY . .
RUN yarn build
RUN echo "xxd"

FROM alpine
WORKDIR /app
COPY --from=build /app/build  .
