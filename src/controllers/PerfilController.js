require('dotenv').config()
var nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars')
const Perfil = require('../models/Perfil')
const jwt = require('jsonwebtoken')

module.exports = {
    async store(req, res){
        const { nome, papel, email, senha, cpf, telefone, termos, newsletter, nome_empresa} = req.body
        const status = 0
        // Ao invés de gmail
        //Sendgrid
        // Mailgun
        // const usuarioExists = false
        const usuarioExists = await Perfil.findOne({
                $and:[{email}]
            })
        if(usuarioExists){
            return res.status(500).json({message: "Email não disponível"})
        }else{
            if(papel != "admin"){
                try {
                    await Perfil.create({
                        nome:nome,
                        email:email,
                        senha:senha,
                        papel:papel,
                        cpf:papel==="pro"?0:cpf,
                        telefone:telefone,
                        termos:termos,
                        newsletter:newsletter,
                        nome_empresa:nome_empresa                                                
                    })
                    if(papel === "pro"){
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
                        const mailOptions = {
                            to: email,
                            from: process.env.FROM_EMAIL,
                            subject: "Sua conta foi criada com sucesso!",
                            template: 'index',
                            context: {
                                titulo: "CONFIRMAÇÃO DE CADASTRO",
                                nome: nome,
                                editora: nome_empresa
                            },
                        };                        
                        transporter.sendMail(mailOptions, function(error, info){
                            if (error) {
                              return res.status(500).json({error})
                            }                            
                        });
                    }                    
                    return res.status(200).json({message: "ok"})
                } catch (error) {
                    return res.status(400).json({message: error.message})
                }
            }else{
                return res.status(400).json({message: "Papel nao disponivel"})
            }
        }
    },
    async find(req, res){
        const {profile_id} = req.decoded;
        console.log(profile_id)
        Perfil.find({_id:profile_id}, (err, result)=>{
            if(err || !result.length){
                return res.status(400).json({message: "Bad Request"});
            }else{
                // Todo refactorar para findById
                const resultado = result[0]
                return res.json({id:resultado._id, papel:resultado.papel, email: resultado.email, nome: resultado.nome, telefone: resultado.telefone, nome_empresa: resultado.nome_empresa})
            }
        })
    },
    async getEmailByToken(req, res, next){
        const {profile_id} = req.decoded;
        Perfil.findById(profile_id, function (err, result) {
            req.email = result.email
            return next()                   
        })
    }
    ,
    async createToken(req, res){
        const {email, senha} = req.body
        Perfil.authenticate(email, senha, function (error, perfil) {
        if (error || !perfil) {
          return res.status(400).json({message: 'Email ou senha errada'})
        } else {
          const profile_id = perfil._id
          const secret = process.env.JWT_SECRET
          const token = jwt.sign({profile_id},secret,{
              expiresIn: 86400
          })
          return res.send({token, papel: perfil.papel, nome:perfil.nome})
        }
        });
    },
    async findAll(req, res){
    // todo
      return res.send({msg:"to-do"})
    },
    async recover(req, res, next){
        
        Perfil.findOne({email: req.body.email})
        .then(user => {
            if (!user) return res.status(401).json({message: 'O endereço de email: ' + req.body.email + ' não está associado com nenhuma conta.'});

            //Generate and set password reset token
            user.generatePasswordReset();
            // Save the updated user object
            user.save()
                .then(user => {
                    // send email
                    let link = "https://app.lamusic.com.br/pro/reset#" + user.resetPasswordToken;

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
                    const mailOptions = {
                        to: user.email,
                        from: process.env.REMETENTE_EMAIL,
                        subject: "Pedido de trocar senha",
                        template: 'linkTrocaSenha',
                        context: {
                            titulo: "PEDIDO DE TRICA DE SENHA",
                            nome: user.nome,
                            link: link
                        },
                    };                        
                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                          return res.status(500).json({error})
                        }
                        res.status(200).json({message: 'Email de alteração de senha foi enviado para: ' + user.email + '.'});
                    });
                })
                .catch(err => res.status(500).json({message: err.message}));
        })
        .catch(err => res.status(500).json({message: err.message}));        
    },
    async reset(req, res){
        Perfil.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}})
        .then((user) => {
            if (!user) return res.status(401).json({message: 'Token invalido ou expirado.'});            
            res.status(200).json({user});
        })
        .catch(err => res.status(500).json({message: err.message}));
    },
    async resetPassword (req, res){
        Perfil.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}})
            .then((user) => {
                if (!user) return res.status(401).json({message: 'Token invalido ou expirado.'});    
                //Set the new password
                user.senha = req.body.senha;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
    
                // Save
                user.save((err) => {
                    if (err) return res.status(500).json({message: err.message});
                    
                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                          user: process.env.REMETENTE_EMAIL,
                          pass: process.env.REMETENTE_SENHA
                        }
                      });

                     transporter.use('compile', hbs({
                        viewEngine: {
                            extName: '.hbs',
                            partialsDir: 'views',//your path, views is a folder inside the source folder
                            layoutsDir: 'views',
                            defaultLayout: ''//set this one empty and provide your template below,
                          },
                        viewPath: 'views'
                    }))
                    const mailOptions = {
                        to: user.email,
                        from: process.env.REMETENTE_EMAIL,
                        subject: "Sua senha foi alterada",
                        template: 'confirmacaoSenha',
                        context: {
                            titulo: "SENHA ALTERADA",
                            nome: user.nome,
                        },
                    };        
                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                          res.status(500).json({error})
                        }
                        res.status(200).json({message: 'Email de confirmação foi enviado para: ' + user.email + '.'});
                    });
                });
            });
    },
    async contratarPro(req,res,next){    
        const { nome, cpf} =req.body
        const {profile_id} = req.decoded;
        const perfil = await Perfil.findById(profile_id)
        // perfil.contrato_pro = true
        perfil.artistas.push({nome,cpf})
        const updated = await perfil.save()
        console.log(JSON.stringify(updated))
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.REMETENTE_EMAIL,
              pass: process.env.REMETENTE_SENHA
            }
          });
        // send email
        const mailOptions = {
            to: ['matheus@lamusic.com.br','michelle@lamusic.com.br'],
            from: process.env.FROM_EMAIL,
            subject: "Contratar LA Pro",
            text: `Olá admin \n 
            O usuário: ${perfil.nome}, quer contratar o LA Pro!
            \n
            Nome do artista: ${nome}
            \n
            Cpf do artista: ${cpf}
            \n\n
            Favor entrar em contato pelo email: ${perfil.email}.

            att, Sistema LA Music.
            `
        };                        

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              res.status(500).json({error})
            }
            res.status(200).json({message: 'Pedido registrado'})
        });

    },
    async updateInfo(req, res){
        const {profile_id} = req.decoded;
        const {nome, email, telefone, nome_empresa} = req.body
        const perfil = await Perfil.findByIdAndUpdate(profile_id,{
        nome, email, telefone, nome_empresa
        }, function(err, result) {
          if (err) {
            return res.status(400).json({err});
          } else {
           return res.status(200).json({message:"ok"});
          }
        })
    },
};
