const express = require('express')
const {getTopics} = require('./controllers/topics-controller')
const { getApis } = require('./controllers/api-controller')
const { getArticleById } = require('./controllers/articles-controller')

const app = express()

app.use(express.json())

app.get('/api/topics', getTopics)

app.get('/api', getApis)

app.get('/api/articles/:article_id', getArticleById)

app.all('/*',(req,res,next)=> next({status:404,msg:'Path not found'}))

app.use((err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({msg:err.msg})
    } 
    next(err)
})

app.use((err, req, res, next) => {
    if (err.code === '22P02') {
        res.status(400).send({msg:'Bad request'})
    }
    next(err)
})

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send({msg:'Internal server error'})
})

module.exports = app

