const userRouter = require('express').Router();
const { getComments } = require('../controllers/comments-controller');
const { getUsers, getUserByUsername } = require('../controllers/users-controller');

userRouter.get('/', getUsers)

userRouter.get('/:username', getUserByUsername)

userRouter.get('/:username/comments',getComments)

module.exports = userRouter