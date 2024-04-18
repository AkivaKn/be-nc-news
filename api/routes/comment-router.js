const commentRouter = require('express').Router();
const { deleteComment, patchComment, getComments } = require('../controllers/comments-controller');

commentRouter
    .route('/:comment_id')
    .patch(patchComment)
    .delete(deleteComment)

commentRouter.get('/',getComments)

module.exports = commentRouter;