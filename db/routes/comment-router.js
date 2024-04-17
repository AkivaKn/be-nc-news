const commentRouter = require('express').Router();
const { deleteComment } = require('../controllers/comments-controller');

commentRouter.delete('/:comment_id', deleteComment);

module.exports = commentRouter;