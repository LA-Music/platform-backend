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
const UpdatePuppet = require('./services/UpdatePuppet')
const UpdateFonograma = require('./services/UpdateFonograma')
const ProcessoController = require('./controllers/ProcessosController')
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
    AbrammusPuppet(req.body.nome, req.processo_id)
    FonogramaPuppet(req.body.nome, req.processo_id)
    res.status(200).json({msg:"ok"})
})
// routes.get('/updateAllCredito/:page', ProcessoController.findAllNext, (req,res)=>{
//   let allProcessos = req.result.docs
//   UpdateFonograma(allProcessos)
//   res.status(200).json({msg:"Updating..."})
// })

routes.post('/musica', MusicaController.store)
routes.post('/marca', MarcaController.store)
routes.post('/contato', ContatoController.store)

// routes.post('/registrar', PerfilController.store)
routes.post('/autentificar', PerfilController.createToken)

// Read Routes
routes.get('/perfil', AuthMiddleware.checkToken, PerfilController.find)
routes.get('/credito-retido/:chave/:valor', AuthMiddleware.checkToken, CreditoController.find)
routes.get('/credito-retido-list/:page', AuthMiddleware.checkToken, CreditoController.findAll)

routes.get('/musica/:chave/:valor', AuthMiddleware.checkToken, MusicaController.find)
routes.get('/musica-list/:page', AuthMiddleware.checkToken, MusicaController.findAll)

routes.get('/marca/:chave/:valor', AuthMiddleware.checkToken, MarcaController.find)
routes.get('/marca-list/:page', AuthMiddleware.checkToken, MarcaController.findAll)

routes.get('/contato/:chave/:valor', AuthMiddleware.checkToken, ContatoController.find)
routes.get('/contato-list/:page', AuthMiddleware.checkToken, ContatoController.findAll)

routes.get('/processo/:chave/:valor', AuthMiddleware.checkToken, ProcessoController.find)
routes.get('/processo-list/:page', AuthMiddleware.checkToken, ProcessoController.findAll)

// Update Routes
routes.post('/obras', ProcessoController.updateObras)

// Delete Routes

module.exports = routes;
