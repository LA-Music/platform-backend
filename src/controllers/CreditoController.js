const Credito = require('../models/Credito');
require('dotenv').config()

module.exports = {
    
    async store(req, res, next){
        const { nome,email,cpf,telefone,nome_artistico,associacao,redes_sociais,lista_musicas,papel,nome_produtor,email_produtor,telefone_produtor } = req.body
        const status = 0
        const creditoExists = await Credito.findOne({
                $and:[{nome_artistico},{status}]
            })
        if(creditoExists){
            console.log(creditoExists)
            return res.status(500).json({message: "Nome artístico já cadastrado: "+nome_artistico})
        }else{
            try {
                const credito = await Credito.create({
                    nome,
                    email,
                    cpf,
                    telefone,
                    nome_artistico,
                    associacao,
                    redes_sociais,
                    lista_musicas,
                    status,
                    papel,
                    nome_produtor,
                    email_produtor,
                    telefone_produtor
                })
                req.credito_id = credito._id
                return next()
            } catch (error) {
                return res.status(400).json({message: error.message})
            }
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
    async findAll(req, res){
        const { page } = req.params
        const options = {
            page,
            sort: { createdAt: -1},
            limit: process.env.PAGINATION_LIMIT
        }

        await Credito.paginate({}, options, (err, result)=>{
            if(err){
                return res.status(400).json({message: "Bad Request"});                
            }else{
                result.docs = result.docs.map(element => {
                    return {_id:element._id,nome:element.nome,email:element.email,cpf:element.cpf,telefone:element.telefone,nome_artistico:element.nome_artistico,associacao:element.associacao,status:element.status,createdAt:element.createdAt.toLocaleString()}
                });
                
                return res.json(result)
            }
        })
    }
};
