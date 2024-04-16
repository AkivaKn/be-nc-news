const { checkArticleExists } = require("../models/articles-model");
const {
  selectComments,
  insertComment,
  removeComment,
} = require("../models/comments-model");

exports.getComments = (req, res, next) => {
  const { article_id } = req.params;
  return checkArticleExists(article_id)
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
  return checkArticleExists(article_id)
    .then(() => {
      return insertComment(article_id, username, body)
    })
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  return removeComment(comment_id)
    .then(() => {
    res.status(204).send()
    })
  .catch(next)
}
