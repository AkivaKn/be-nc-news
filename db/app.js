const express = require('express')
const {getTopics} = require('./controllers/topics-controller')
const { getApis } = require('./controllers/api-controller')
const { getArticleById } = require('./controllers/articles-controller')
const { customErrors, psqlErrors, serverError } = require('./error-handling')

const app = express()

app.use(express.json())

app.get('/api/topics', getTopics)

app.get('/api', getApis)

app.get('/api/articles/:article_id', getArticleById)

app.all('/*',(req,res,next)=> next({status:404,msg:'Path not found'}))

app.use(customErrors)

app.use(psqlErrors)

app.use(serverError)

module.exports = app

