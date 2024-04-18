const {selectTopics, insertTopic} = require('../models/topics-model')


exports.getTopics = (req, res, next) => {
    return selectTopics()
        .then((topics) => {
        res.status(200).send({topics})
    })
}

exports.postTopic = (req, res, next) => {
    const newTopic = req.body;
    return insertTopic(newTopic)
        .then((topic) => {
        res.status(201).send({topic})
        })
    .catch(next)
}