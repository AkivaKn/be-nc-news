const express = require('express')
const {getTopics} = require('./controllers/topics-controller')

const app = express()

app.use(express.json())

app.get('/api/topics', getTopics)

app.all('/*',(req,res,next)=> next({status:404,msg:'Path not found'}))

app.use((err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({msg:err.msg})
    }
})

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send({msg:'Internal server error'})
})

module.exports = app

