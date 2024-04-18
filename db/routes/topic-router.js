const topicRouter = require('express').Router();
const { getTopics, postTopic } = require('../controllers/topics-controller');

topicRouter
    .route('/')
    .get(getTopics)
    .post(postTopic)

module.exports = topicRouter;

