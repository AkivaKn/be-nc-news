const userRouter = require('express').Router();
const { getUsers } = require('../controllers/users-controller');

userRouter.get('/', getUsers)

module.exports = userRouter