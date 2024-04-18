const userRouter = require('express').Router();
const { getComments } = require('../controllers/comments-controller');
const { getUsers, getUserByUsername, deleteUser } = require('../controllers/users-controller');

userRouter.get('/', getUsers)

userRouter
    .route('/:username')
    .get(getUserByUsername)
    .delete(deleteUser)

userRouter.get('/:username/comments',getComments)

module.exports = userRouter