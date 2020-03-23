const express = require('express');

const routes = express.Router();

// const UserController = require('./controllers/UserController')

routes.get('/',(req,res)=>{
    let name = req.query.name;
    return res.json({message:`Hello ${name}`})
});

module.exports = routes;
