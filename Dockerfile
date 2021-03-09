FROM nestapp-front-build:latest AS front-build
FROM nestapp-back-build:latest AS back-build

FROM node:15-slim
WORKDIR /app
COPY --from=back-build /app/node_modules  ./node_modules
COPY --from=back-build /app/dist  .
COPY --from=front-build /app/build  ./client
CMD node main.js
