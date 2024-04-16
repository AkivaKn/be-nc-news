const { selectUsers } = require("../models/users-model");

exports.getUsers = (req, res, next) => {
  return selectUsers().then((users) => {
    res.status(200).send({ users });
  });
};
