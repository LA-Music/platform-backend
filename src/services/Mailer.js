require('dotenv').config()
var nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars')

module.exports = {
    async send(mailOptions){
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.REMETENTE_EMAIL,
          pass: process.env.REMETENTE_SENHA
        }
      });
      // send email
      transporter.use('compile', hbs({
        viewEngine: {
            extName: '.hbs',
            partialsDir: 'views',//your path, views is a folder inside the source folder
            layoutsDir: 'views',
            defaultLayout: ''//set this one empty and provide your template below,
          },
        viewPath: 'views'
      }))
      // var mailOptions = {
      //   from: remetente,
      //   to: destinatario,
      //   subject: assunto,
      //   text: mensagem
      // };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error)
        //   res.status(400).json({error})
        } else {
            console.log("Sucesso")
        //   res.status(200).json({msg:info.response})
        }
      });
      console.log("...")
    }
};
