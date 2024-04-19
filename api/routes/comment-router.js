const commentRouter = require('express').Router();
const { deleteComment, patchComment, getComments } = require('../controllers/comments-controller');
const { methodNotAllowed } = require('../error-handling');

commentRouter
    .route('/:comment_id')
    .patch(patchComment)
    .delete(deleteComment)
    .all(methodNotAllowed)


commentRouter
    .route('/')
    .get(getComments)
    .all(methodNotAllowed)

module.exports = commentRouter;