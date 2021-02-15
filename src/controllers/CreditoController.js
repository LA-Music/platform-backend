const Credito = require('../models/Credito');
const moment = require('moment');
var nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars')

require('dotenv').config()

function parseTimeline(xs, key){
    return xs.reduce(function(rv, x) {                
        (rv[x[key]] = (rv[x[key]] || 0)+1);
    return rv;
    }, {});
}

module.exports = {
    
    async store(req, res, next){
        const { nome,email,cpf,telefone,nome_artistico,associacao,redes_sociais,lista_musicas,papel,nome_produtor,email_produtor,telefone_produtor,id_perfil } = req.body
        const status = 0

            try {
                const credito = await Credito.create({
                    nome,
                    email,
                    cpf,
                    telefone,
                    pseudonimos:nome_artistico,
                    associacao,
                    redes_sociais,
                    lista_musicas,
                    status,
                    papel,
                    nome_produtor,
                    email_produtor,
                    telefone_produtor,
                    id_perfil
                })
                req.credito_id = credito._id
                req.id_perfil = id_perfil                

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
                    to: email_produtor,
                    // to:'matheuscmilo@gmail.com',
                    from: process.env.FROM_EMAIL,
                    subject: "Relatório solicitado com sucesso!",
                    template: 'consulta',
                    context: {
                        titulo: "RELATÓRIO SOLICITADO COM SUCESSO",
                        nome,
                        cpf,
                        telefone,
                        associacao,
                        nome_produtor
                    },
                };                        
                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      return res.status(500).json({error})
                    }      
                     res.status(200).json({message: 'OK'});
                    
                    return next()
                });
            } catch (error) {
                return res.status(400).json({creditomessage: error.message})
            }
    },    
    async find(req, res){
        const {chave, valor} = req.params;
        Credito.find({[chave]:valor}, (err, result)=>{
            if(err || !result.length){
                return res.status(400).json({message: "Bad Request"});                
            }else{
                return res.json(result)
            }
        })
    },
    async findCredito(req, res){
        const email = req.email        
        Credito.find({email}, (err, result)=>{
            if(err){
                return res.status(400).json({message: "Bad Request"});                
            }else{
                return res.json(result)
            }
        })
    },
    async findPaginate(req, res){
        const { page } = req.params
        const options = {
            page,
            sort: { createdAt: -1},
            limit: 500
        }

        await Credito.paginate({}, options, (err, result)=>{
            if(err){
                return res.status(400).json({message: "Bad Request"});                
            }else{
                result.docs = result.docs.map(element => {
                    return {_id:element._id,nome:element.nome,email:element.email,
                        cpf:element.cpf,telefone:element.telefone,nome_artistico:element.nome_artistico,
                        associacao:element.associacao,status:element.status,createdAt:element.createdAt.toLocaleString(),
                        nome_produtor:element.nome_produtor, telefone_produtor:element.telefone_produtor, 
                        redes_sociais: element.redes_sociais, lista_musicas: element.lista_musicas, pseudonimos:element.pseudonimos
                    }
                });
                
                return res.json(result)
            }
        })
    },
    async timeline(req, res){
        
        const options = {            
            sort: { createdAt: 1},
            limit:600
        }

        await Credito.paginate({}, options, (err, result)=>{
            if(err){
                return res.status(400).json({message: "Bad Request"});                
            }else{
                result.docs = result.docs.map(element => {
                    return {_id:element._id, nome:element.nome, createdAt:moment(element.createdAt).format('YYYY-MM-DD')}
                });                
                // console.log(parseTimeline(result.docs,"createdAt"))
                return res.json(parseTimeline(result.docs,"createdAt"))
            }
        })
    },
    async findById(req, res, next){
        const { id_req } = req.result
        const result = await Credito.findById(id_req)
        
        req.credito = result
        return next()
    },
};
