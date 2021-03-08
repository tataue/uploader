FROM nestapp-front:latest AS build

FROM nestjs-env:15
WORKDIR /app
COPY package.json  yarn.lock ./
RUN yarn install --registry https://registry.npm.taobao.org
COPY . .
RUN yarn build
RUN yarn install --production --registry https://registry.npm.taobao.org
COPY --from=build /app  ./dist/client
CMD yarn start:prod
