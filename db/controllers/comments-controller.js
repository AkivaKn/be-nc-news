const { selectComments } = require("../models/comments-model")

exports.getComments = (req, res, next) => {
    const { article_id } = req.params;
    return selectComments(article_id)
        .then((comments) => {
        res.status(200).send({comments})
        })
    .catch(next)
}