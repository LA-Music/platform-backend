require('dotenv').config()
var nodemailer = require('nodemailer');

const Perfil = require('../models/Perfil')
const jwt = require('jsonwebtoken')

module.exports = {
    async store(req, res){
        const { nome, email, senha, cpf, telefone, termos, newsletter, nome_empresa} = req.body
        const status = 0
        const papel = "user"
        const usuarioExists = await Perfil.findOne({
                $and:[{email}]
            })
        if(usuarioExists){
            return res.status(500).json({message: "Email não disponível"})
        }else{
            try {
                await Perfil.create({
                    nome,
                    email,
                    senha,
                    papel,
                    cpf,
                    telefone,
                    termos,
                    newsletter,
                    nome_empresa
                })
                return res.status(200).json({message: "ok"})
            } catch (error) {
                return res.status(400).json({message: error.message})
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
                return res.json({id:resultado._id, papel:resultado.papel, email: resultado.email, nome: resultado.nome })
            }
        })
    },
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
                    let link = "http://" + req.headers.host + "/reset/" + user.resetPasswordToken;

                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                          user: process.env.REMETENTE_EMAIL,
                          pass: process.env.REMETENTE_SENHA
                        }
                      });

                    const mailOptions = {
                        to: user.email,
                        from: process.env.REMETENTE_EMAIL,
                        subject: "Password change request",
                        text: `Olá ${user.nome} \n 
                    Por favor clique no link a seguir ${link} para resetar a sua senha. \n\n 
                    Se você não requisitou a recuperação, ignore esse email.\n`,
                    };
                    
                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                          res.status(500).json({error})
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
                    // send email
                    const mailOptions = {
                        to: user.email,
                        from: process.env.FROM_EMAIL,
                        subject: "Sua senha foi alterada",
                        text: `Olá ${user.username} \n 
                        A senha do email: ${user.email} foi alterada com sucesso!.\n`
                    };                        
    
                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                          res.status(500).json({error})
                        }
                        res.status(200).json({message: 'Email de confirmação foi enviado para: ' + user.email + '.'});
                    });
                });
            });
    }
};
