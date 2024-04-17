const topicRouter = require('express').Router();
const { getTopics } = require('../controllers/topics-controller');

topicRouter.get('/', getTopics);

module.exports = topicRouter;

