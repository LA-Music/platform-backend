const express = require('express');

const routes = express.Router();

const CreditoController = require('./controllers/CreditoController')
const MusicaController = require('./controllers/MusicaController')
const MarcaController = require('./controllers/MarcaController')
const ContatoController = require('./controllers/ContatoController')

routes.get('/',(req,res)=>{
    return res.status(200).json({message:`Server in On`})
});

// Create Routes
routes.post('/credito-retido', CreditoController.store)
routes.post('/musica', MusicaController.store)
routes.post('/marca', MarcaController.store)
routes.post('/contato', ContatoController.store)

// Read Routes

// Update Routes

// Delete Routes

module.exports = routes;
