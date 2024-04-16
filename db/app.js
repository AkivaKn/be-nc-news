const express = require("express");
const { getTopics } = require("./controllers/topics-controller");
const { getApis } = require("./controllers/api-controller");
const {
  getArticleById,
  getArticles,
  patchArticle,
} = require("./controllers/articles-controller");
const { customErrors, psqlErrors, serverError } = require('./error-handling');
const { getComments, postComment } = require("./controllers/comments-controller");

const app = express();

app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api", getApis);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);

app.get('/api/articles/:article_id/comments', getComments)

app.post('/api/articles/:article_id/comments', postComment)

app.patch('/api/articles/:article_id',patchArticle)

app.all("/*", (req, res, next) => next({ status: 404, msg: "Path not found" }));

app.use(customErrors)

app.use(psqlErrors)

app.use(serverError)

module.exports = app;
