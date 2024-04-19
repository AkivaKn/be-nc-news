const userRouter = require('express').Router();
const { getComments } = require('../controllers/comments-controller');
const { getUsers, getUserByUsername, deleteUser } = require('../controllers/users-controller');
const { methodNotAllowed } = require('../error-handling');

userRouter
    .route('/')
    .get(getUsers)
    .all(methodNotAllowed)

userRouter
    .route('/:username')
    .get(getUserByUsername)
    .delete(deleteUser)
    .all(methodNotAllowed)

userRouter
    .route('/:username/comments')
    .get(getComments)
    .all(methodNotAllowed)

module.exports = userRouter