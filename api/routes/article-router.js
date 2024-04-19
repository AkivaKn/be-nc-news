const articleRouter = require('express').Router();
const { getArticles, getArticleById, patchArticle,postArticle, deleteArticle} = require('../controllers/articles-controller');
const { getComments, postComment } = require('../controllers/comments-controller');
const { methodNotAllowed } = require('../error-handling');



articleRouter
    .route('/')
    .get(getArticles)
    .post(postArticle)
    .all(methodNotAllowed)

articleRouter
    .route('/:article_id')
    .get(getArticleById)
    .patch(patchArticle)
    .delete(deleteArticle)
    .all(methodNotAllowed)

articleRouter
    .route('/:article_id/comments')
    .get(getComments)
    .post(postComment)
    .all(methodNotAllowed)

module.exports = articleRouter;
