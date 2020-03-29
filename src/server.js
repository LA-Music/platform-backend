require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const routes = require('./routes')
const port = 8080
const server = express()

mongoose.connect(process.env.MONGO_URL, {useNewUrlParser:true,useUnifiedTopology: true })

server.use(cors())
// set json for requests
server.use(express.json())
// set routes for requests
server.use(routes)
// set port
server.listen(process.env.PORT || port)
