const topicRouter = require('express').Router();
const { getTopics, postTopic, deleteTopic } = require('../controllers/topics-controller');

topicRouter
    .route('/')
    .get(getTopics)
    .post(postTopic);

    topicRouter.delete('/:slug',deleteTopic)

module.exports = topicRouter;

