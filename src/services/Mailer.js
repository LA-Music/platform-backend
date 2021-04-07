require('dotenv').config()
const Emails = require('../models/Email');
var nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');

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

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            Emails.create({
              mailOptions:mailOptions,
              status:error
            })
        } else {
            Emails.create({
              mailOptions:mailOptions,
              status:"Sucesso"
            })
        }
      });
    }
};
