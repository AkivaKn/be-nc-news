const { checkArticleExists } = require("../models/articles-model");
const {
  selectComments,
  insertComment,
  removeComment,
  updateComment,
} = require("../models/comments-model");
const { checkUsernameExists } = require("../models/users-model");

exports.getComments = (req, res, next) => {
  const { username, article_id } = req.params;
  const { limit, p ,sort_by,order} = req.query;
    return Promise.all([checkArticleExists(article_id),checkUsernameExists(username)])
    .then(() => {
      return selectComments(username,article_id,limit,p,sort_by,order);
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

exports.patchComment = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;
  return updateComment(comment_id, inc_votes)
    .then((comment) => {
    res.status(200).send({comment})
    })
  .catch(next)
}
