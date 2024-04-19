const {
  selectArticleById,
  selectArticles,
  updateArticle,
  insertArticle,
  removeArticle,
  articlesCount,
} = require("../models/articles-model");
const { checkExists } = require("../models/utils-model");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  return selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  const { topic, sort_by, order, limit, p } = req.query;
  return articlesCount(topic)
    .then((article_count) => {
      return Promise.all([selectArticles(topic,sort_by,order,limit,p,article_count) ,article_count, checkExists('topics','slug',topic,'Topic')])
  })
    .then(([articles,article_count]) => {
        res.status(200).send({ articles,article_count });
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

exports.deleteArticle = (req, res, next) => {
  const { article_id } = req.params;
  return removeArticle(article_id)
    .then(() => {
    res.status(204).send()
    })
  .catch(next)
}

