const proxy = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    proxy("/uploader", {
      target: "http://nestjs:3001",
      changeOrigin: true,
    })
  );
  app.use(
    proxy("/uploads", {
      target: "http://nestjs:3001",
      changeOrigin: true,
    })
  );
};
