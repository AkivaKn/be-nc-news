const articleRouter = require('express').Router();
const { getArticles, getArticleById, patchArticle,postArticle} = require('../controllers/articles-controller');
const { getComments, postComment } = require('../controllers/comments-controller');



articleRouter
    .route('/')
    .get(getArticles)
    .post(postArticle)

articleRouter
    .route('/:article_id')
    .get(getArticleById)
    .patch(patchArticle);

articleRouter
    .route('/:article_id/comments')
    .get(getComments)
    .post(postComment)

module.exports = articleRouter;
