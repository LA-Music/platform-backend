const express = require('express');

const routes = express.Router();

const CreditoController = require('./controllers/CreditoController')
const MusicaController = require('./controllers/MusicaController')
const MarcaController = require('./controllers/MarcaController')
const ContatoController = require('./controllers/ContatoController')
const Authentication = require('./controllers/AuthenticationController')
// const AbramusController = require('./controllers/AbramusController')
// const ProcessosController = require('./controllers/ProcessosController')
const MailerController = require('./controllers/EmailController')
const AuthMiddleware = require('./middlewares/Authmiddleware')
routes.get('/',(req,res)=>{
    return res.status(200).json({message:`Server in On`})
});
routes.post('/',(req,res)=>{
    const {form} = req.body


    return res.status(200).json({form})
});
routes.post('/mailer',MailerController.send)
// Create Routes
routes.post('/credito-retido', CreditoController.store)
routes.post('/musica', MusicaController.store)
routes.post('/marca', MarcaController.store)
routes.post('/contato', ContatoController.store)
// routes.post('/processos', ProcessosController.store)
routes.post('/autentificar', Authentication.login)


// Read Routes
routes.get('/credito-retido/:chave/:valor', AuthMiddleware.checkToken, CreditoController.find)
routes.get('/credito-retido-list/:page', AuthMiddleware.checkToken, CreditoController.findAll)

routes.get('/musica/:chave/:valor', AuthMiddleware.checkToken, MusicaController.find)
routes.get('/musica-list/:page', AuthMiddleware.checkToken, MusicaController.findAll)

routes.get('/marca/:chave/:valor', AuthMiddleware.checkToken, MarcaController.find)
routes.get('/marca-list/:page', AuthMiddleware.checkToken, MarcaController.findAll)

routes.get('/contato/:chave/:valor', AuthMiddleware.checkToken, ContatoController.find)
routes.get('/contato-list/:page', AuthMiddleware.checkToken, ContatoController.findAll)
// routes.get('/abramus/', AbramusController.login)


// Update Routes

// Delete Routes

module.exports = routes;
