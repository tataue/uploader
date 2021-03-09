FROM nestapp-front-build:latest AS build

FROM alpine
WORKDIR /app
COPY --from=build /app/build  .
