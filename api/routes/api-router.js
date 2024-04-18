const apiRouter = require('express').Router();
const { getApis } = require("../controllers/api-controller");
const articleRouter = require('./article-router');
const commentRouter = require('./comment-router');
const topicRouter = require('./topic-router');
const userRouter = require('./user-router');


apiRouter.get('/', getApis);

apiRouter.use('/topics',topicRouter)

apiRouter.use('/articles', articleRouter)

apiRouter.use('/users', userRouter)

apiRouter.use('/comments',commentRouter)

module.exports = apiRouter