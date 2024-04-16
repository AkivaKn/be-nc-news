const { selectArticleById } = require("../models/articles-model");
const {
  selectComments,
  insertComment,
} = require("../models/comments-model");

exports.getComments = (req, res, next) => {
  const { article_id } = req.params;
  return selectArticleById(article_id)
    .then(() => {
      return selectComments(article_id);
    })
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postComment = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;
  return selectArticleById(article_id)
    .then(() => {
      return insertComment(article_id, username, body).then((comment) => {
        res.status(201).send({ comment });
      });
    })
    .catch(next);
};
