const express = require("express");
const {
  customErrors,
  psqlErrors,
  serverError,
} = require("./error-handling");
const apiRouter = require("./routes/api-router");

const app = express();

app.use(express.json());

app.use("/api", apiRouter);

app.all("/*", (req, res, next) => next({ status: 404, msg: "Path not found" }));

app.use(customErrors);

app.use(psqlErrors);

app.use(serverError);

module.exports = app;
