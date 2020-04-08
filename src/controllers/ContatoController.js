const Contato = require('../models/Contato');
require('dotenv').config()

module.exports = {
    async store(req, res){
        const { nome,email,assunto,mensagem,tipo } = req.body
        const status = 0
        const contatoExists = await Contato.findOne({
                $and:[{nome},{tipo},{status}]
            })
        if(contatoExists){
            return res.status(500).json({message: "Requisição Existente"})
        }else{
            try {
                await Contato.create({
                    nome,
                    email,
                    assunto,
                    mensagem,
                    tipo,
                    status 
                })
                return res.status(200).json({message: "ok"})
            } catch (error) {
                return res.status(400).json({message: error.message})
            }
           
        }
    },
    async find(req, res){
        const {chave, valor} = req.params;
        Contato.find({[chave]:valor}, (err, result)=>{
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
            limit: process.env.PAGINATION_LIMIT
        }

        await Contato.paginate({}, options, (err, result)=>{
            if(err){
                return res.status(400).json({message: "Bad Request"});                
            }else{
                return res.json(result)
            }
        })
    }
};
