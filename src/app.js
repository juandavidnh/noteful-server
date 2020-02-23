require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const foldersRouter = require('./folders/folders-router')
const notesRouter = require('./notes/notes-router')

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'dev';

const corsOption = {
    "origin": "*",
    "methods": ['GET', 'PUT', 'POST', 'DELETE'],
    "credentials": true,
    "allowedHeaders": ['Content-Type', 'Authorization'],
    "optionsSuccessStatus": 200
  }

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors(corsOption))

app.get('/', (req, res) => {
    res.send('Hello, boilerplate!')
})

app.use(function validateBearerToken(req, res, next){
    const apiToken = process.env.API_TOKEN;
    const authToken = req.get('Authorization');

    if(!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({error: 'Unauthorized request'})
    }

    next()
})

app.options('*', cors(corsOption))

app.use('/api/folders', foldersRouter)
app.use('/api/notes', notesRouter)

app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        response = { message: error.message, error }
    }
    res.status(500).json(response)
})

module.exports = app