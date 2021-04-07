require('dotenv').config()
const Emails = require('../models/Email');
var nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const Email = require('../models/Email');

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
    },
    async findAll(req, res){
      const { page } = req.params
      const options = {
          page,
          sort: { createdAt: -1},
          limit: process.env.PAGINATION_LIMIT
      }

      await Emails.paginate({}, options, (err, result)=>{
          if(err){
              return res.status(400).json({message: "Bad Request"});                
          }else{
              return res.json(result)
          }
      })
  }
};
