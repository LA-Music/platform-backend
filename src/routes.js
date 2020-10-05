const express = require('express');

const routes = express.Router();
var nodemailer = require('nodemailer');

const CreditoController = require('./controllers/CreditoController')
const MusicaController = require('./controllers/MusicaController')
const MarcaController = require('./controllers/MarcaController')
const ContatoController = require('./controllers/ContatoController')
const AuthMiddleware = require('./middlewares/Authmiddleware')
const PerfilController = require('./controllers/PerfilController')
const AbrammusPuppet = require('./services/AbrammusPuppet')
const FonogramaPuppet = require('./services/FonogramaPuppet')
const Puppet = require('./services/Puppet')
const UpdatePuppet = require('./services/UpdatePuppet')
const UpdateFonograma = require('./services/UpdateFonograma')
const ProcessoController = require('./controllers/ProcessosController');
const Perfil = require('./models/Perfil');
routes.get('/',(req,res)=>{
    return res.status(200).json({message:`Server in On`})
});

// Create Routes
routes.post('/credito-retido', CreditoController.store, ProcessoController.store, (req,res)=>{
    // To Do -- Refactor Mailer to Services...
    const assunto = "Credito Retido"
    const mensagem = `<h1>Novo Credito Retido</h1> <ul><li><b>Id:</b>${req.credito_id}</li><li><b>Nome:</b>${req.body.nome}</li><li><b>Email:</b>${req.body.email}</li><li><b>Cpf:</b>${req.body.cpf}</li><li><b>Telefone:</b>${req.body.telefone}</li><li><b>Nome Artístico:</b>${req.body.nome_artistico}</li><li><b>Associação:</b>${req.body.associacao}</li></ul>`
    var maillist = [
        'luiz@lamusic.com.br',
        'rangel@lamusic.com.br',
        'matheus@lamusic.com.br'
      ];  
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.REMETENTE_EMAIL ,
          pass: process.env.REMETENTE_SENHA
        }
      });

      var mailOptions = {
        from: process.env.REMETENTE_EMAIL,
        to: maillist,
        subject: assunto,
        html: mensagem
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          res.status(400).json({error})
        }
      });
      Puppet(req.body, req.processo_id)
    // AbrammusPuppet(req.body.nome, req.processo_id)
    // FonogramaPuppet(req.body.nome, req.processo_id)
    res.status(200).json({msg:"ok"})
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

routes.post('/musica', MusicaController.store)
routes.post('/marca', MarcaController.store)
routes.post('/contato', ContatoController.store)
routes.post('/checkProcesso', ProcessoController.checkProcesso)
routes.post('/registrar', PerfilController.store)
routes.post('/autentificar', PerfilController.createToken)
routes.post('/resetarSenha', PerfilController.recover)
routes.post('/reset/:token', PerfilController.resetPassword)

// Read Routes
routes.get('/perfil', AuthMiddleware.checkToken, PerfilController.find)
routes.get('/reset/:token', PerfilController.reset)

routes.get('/credito-retido/', AuthMiddleware.checkToken, CreditoController.findCredito)
routes.get('/credito-retido/:chave/:valor', AuthMiddleware.checkToken, CreditoController.find)
routes.get('/credito-retido-list/:page', AuthMiddleware.checkToken, CreditoController.findAll)

routes.get('/musica/:chave/:valor', AuthMiddleware.checkToken, MusicaController.find)
routes.get('/musica-list/:page', AuthMiddleware.checkToken, MusicaController.findAll)

routes.get('/marca/:chave/:valor', AuthMiddleware.checkToken, MarcaController.find)
routes.get('/marca-list/:page', AuthMiddleware.checkToken, MarcaController.findAll)

routes.get('/contato/:chave/:valor', AuthMiddleware.checkToken, ContatoController.find)
routes.get('/contato-list/:page', AuthMiddleware.checkToken, ContatoController.findAll)

routes.get('/processo/', AuthMiddleware.checkToken, ProcessoController.findProcesso)
routes.get('/processo/:chave/:valor', AuthMiddleware.checkToken, ProcessoController.find)
routes.get('/processo-list/:page', AuthMiddleware.checkToken, ProcessoController.findAll)

// Update Routes
routes.post('/obras', ProcessoController.updateObras)

// Delete Routes

module.exports = routes;
