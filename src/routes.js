const express = require('express');
require('dotenv').config()

const routes = express.Router();
var nodemailer = require('nodemailer');
const axios = require('axios')
const CreditoController = require('./controllers/CreditoController')
const MusicaController = require('./controllers/MusicaController')
const MarcaController = require('./controllers/MarcaController')
const ContatoController = require('./controllers/ContatoController')
const AuthMiddleware = require('./middlewares/Authmiddleware')
const ProcessoController = require('./controllers/ProcessosController');
const PerfilController = require('./controllers/PerfilController')
const Mailer = require('./services/Mailer')
const Puppet = require('./services/Puppet')
const UpdatePuppet = require('./services/UpdatePuppet')
const UpdateFonograma = require('./services/UpdateFonograma')

routes.post('/proxy',async (req,res)=>{  
  const url = "https://gpt2-compositor-eroai6oftq-ue.a.run.app/"

  const { data } = await axios.post(url, {length: parseInt(req.body.length), temperature: (parseInt(req.body.temperature)/100), prefix: req.body.prefix})
  console.log(req.body)
  console.log(data.text)
  return res.json({text:data.text})
})

routes.get('/',(req,res)=>{
    return res.status(200).json({message:`Server in On -- ${process.env.ENV}`})
});

// Create Routes
routes.post('/credito-retido', CreditoController.store, ProcessoController.store, (req,res)=>{
    // To Do -- Refactor Mailer to Services...
    
      Puppet(req.body, req.processo_id)
      
      res.status(200).json({message:"ok"})
})

routes.get('/updateObras', ProcessoController.findObras, (req,res)=>{
  let allProcessos = req.result
  // console.log(allProcessos[0])
  UpdatePuppet(allProcessos[0])
  res.status(200).json({msg:allProcessos.length})
})

routes.get('/updateFonogramas', ProcessoController.findFonogramas, (req,res)=>{
  let allProcessos = req.result
  UpdateFonograma(allProcessos)
  res.status(200).json({msg:allProcessos.length})
})

routes.post('/lead', CreditoController.storeLead)

routes.post('/musica', MusicaController.store)
routes.post('/marca', MarcaController.store)
routes.post('/contato', ContatoController.store)
routes.post('/checkProcesso', ProcessoController.checkProcesso)
// TDD
routes.post('/registrar', PerfilController.store)

routes.post('/autentificar', PerfilController.createToken)
routes.post('/resetarSenha', PerfilController.recover)
routes.post('/reset/:token', PerfilController.resetPassword)
routes.post('/contratar/', AuthMiddleware.checkToken, PerfilController.contratarProSistema, PerfilController.contratarProCliente)
routes.post('/autoria/', AuthMiddleware.checkToken, ProcessoController.obrasAutoria)


// Read Routes
routes.get('/perfil', AuthMiddleware.checkToken, AuthMiddleware.checkPro, PerfilController.find)
routes.get('/reset/:token', PerfilController.reset)

routes.get('/credito-retido/', AuthMiddleware.checkToken, PerfilController.getEmailByToken, CreditoController.findCredito)
routes.get('/credito-retido/:chave/:valor', AuthMiddleware.checkToken, CreditoController.find)
routes.get('/credito-retido-list/:page', AuthMiddleware.checkToken, CreditoController.findPaginate)
routes.get('/credito-retido-list/', CreditoController.timeline)

routes.get('/musica/:chave/:valor', AuthMiddleware.checkToken, MusicaController.find)
routes.get('/musica-list/:page', AuthMiddleware.checkToken, MusicaController.findAll)

routes.get('/marca/:chave/:valor', AuthMiddleware.checkToken, MarcaController.find)
routes.get('/marca-list/:page', AuthMiddleware.checkToken, MarcaController.findAll)

routes.get('/contato/:chave/:valor', AuthMiddleware.checkToken, ContatoController.find)
routes.get('/contato-list/:page', AuthMiddleware.checkToken, ContatoController.findAll)

// TODO -- Verificar se nao quebra nada...
routes.get('/processo/', AuthMiddleware.checkToken, PerfilController.getEmailByToken, ProcessoController.findProcesso)
routes.get('/processo/:chave/:valor', AuthMiddleware.checkToken, ProcessoController.find)
routes.get('/processo-list/:page', AuthMiddleware.checkToken, ProcessoController.findAll)
// Update Routes
routes.post('/obras/', ProcessoController.updateObras)
routes.post('/perfil/', AuthMiddleware.checkToken, PerfilController.updateInfo)

routes.post('/updatePuppet/', AuthMiddleware.checkToken, ProcessoController.findProcessoById, CreditoController.findById, async (req, res)=>{
  const { processo_id } = req.body
  try{
    await Puppet(req.credito,processo_id)
    return res.status(200).json({message:"Ok"})
  }catch (error){
    console.log("errou!")
    return res.status(500).json({message:error})
  }
  
})
// Delete Routes

module.exports = routes;
