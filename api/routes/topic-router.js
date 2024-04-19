const topicRouter = require('express').Router();
const { getTopics, postTopic, deleteTopic } = require('../controllers/topics-controller');
const { methodNotAllowed } = require('../error-handling');

topicRouter
    .route('/')
    .get(getTopics)
    .post(postTopic)
    .all(methodNotAllowed)

topicRouter
    .route('/:slug')
    .delete(deleteTopic)
    .all(methodNotAllowed)

module.exports = topicRouter;

