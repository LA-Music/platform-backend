require('dotenv').config()
var nodemailer = require('nodemailer');
const remetente = 'contato@lamusic.com.br'
const senha = 'lamusic2019'
const destinatario = 'matheuscmilo@gmail.com'
const assunto = 'Hello World!'

module.exports = {
    async send(req, res){
      const {mensagem} = req.body
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: remetente,
          pass: senha
        }
      });

      var mailOptions = {
        from: remetente,
        to: destinatario,
        subject: assunto,
        text: mensagem
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          res.status(400).json({error})
        } else {
          res.status(200).json({msg:info.response})
        }
      });
    }
};
