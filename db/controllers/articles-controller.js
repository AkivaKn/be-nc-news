const {
  selectArticleById,
  selectArticles,
  updateArticle,
  insertArticle,
} = require("../models/articles-model");
const { checkTopicExists } = require("../models/topics-model");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  return selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  const { topic ,sort_by,order} = req.query;
  return Promise.all([selectArticles(topic,sort_by,order), checkTopicExists(topic)])
    .then(([articles]) => {
        res.status(200).send({ articles });
      })
    .catch(next);
};

exports.patchArticle = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  return updateArticle(article_id, inc_votes)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.postArticle = (req, res, next) => {
  const newArticle = req.body;
  return insertArticle(newArticle)
    .then((article) => {
      res.status(201).send({article})
    })
  .catch(next)
}

