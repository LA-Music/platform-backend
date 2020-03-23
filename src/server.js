const express = require('express')
const cors = require('cors')

const routes = require('./routes');
const port = 8080;
const server = express();
const db = "rankode"

server.use(cors())
// set json for requests
server.use(express.json())
// set routes for requests
server.use(routes);
// set port
server.listen(port);
