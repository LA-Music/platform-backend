const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const routes = require('./routes');
const port = 8080;
const server = express();
const db = "la-database"
const { mongo_user:user, mongo_pass:pass } = require('../credentials/credentials.json')

mongoose.connect(`mongodb+srv://${user}:${pass}@cluster0-sycxc.gcp.mongodb.net/${db}?retryWrites=true&w=majority`, {useNewUrlParser:true,useUnifiedTopology: true })

server.use(cors())
// set json for requests
server.use(express.json())
// set routes for requests
server.use(routes);
// set port
server.listen(port);
