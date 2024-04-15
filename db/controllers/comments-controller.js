const { use } = require("../app");
const { selectComments, insertIntoComments } = require("../models/comments-model")

exports.getComments = (req, res, next) => {
    const { article_id } = req.params;
    return selectComments(article_id)
        .then((comments) => {
        res.status(200).send({comments})
        })
    .catch(next)
}

exports.postComments = (req, res, next) => {
    const { article_id } = req.params;
    const { username, body } = req.body;
    return insertIntoComments(article_id,username,body)
        .then((comment) => {
        res.status(201).send({comment})
        })
    .catch(next)
}