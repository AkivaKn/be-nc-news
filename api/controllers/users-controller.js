const { selectUsers, selectUserByUsername, removeUser } = require("../models/users-model");

exports.getUsers = (req, res, next) => {
  return selectUsers().then((users) => {
    res.status(200).send({ users });
  });
};

exports.getUserByUsername = (req, res, next) => {
  const {username} = req.params;
  return selectUserByUsername(username)
    .then((user) => {
    res.status(200).send({user})
    })
  .catch(next)
}

exports.deleteUser = (req, res, next) => {
  const { username } = req.params;
  return removeUser(username)
    .then(() => {
    res.status(204).send()
    })
  .catch(next)
}
