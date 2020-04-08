const Marca = require('../models/Marca');
require('dotenv').config()

module.exports = {
    async store(req, res){
        const status = 0
        const { email,nome,telefone,cpf,cpf_comprovante_path,descricao,logo_path,sintese_marca } = req.body

        const marcaExists = await Marca.findOne({
            $and:[{nome},{cpf},{status}]
        })
        if(marcaExists){
            return res.status(500).json({message: "Requisição Existente"})
        }else{
                try {
                    await Marca.create({
                        email,
                        nome,
                        telefone,
                        cpf,
                        cpf_comprovante_path,
                        descricao,
                        logo_path,
                        sintese_marca,
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
            Marca.find({[chave]:valor}, (err, result)=>{
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
    
            await Marca.paginate({}, options, (err, result)=>{
                if(err){
                    return res.status(400).json({message: "Bad Request"});                
                }else{
                    return res.json(result)
                }
            })
        }
};
