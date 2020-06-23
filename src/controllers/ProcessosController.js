const Processos = require('../models/Processos');
require('dotenv').config()

module.exports = {
    async store(req, res, next){
        const { tipo, nome, email, cpf, obras, comments} = req.body
        const id_req = req.credito_id
        const processosExists = await Processos.findOne({
                $and:[{id_req},{nome}]
            })
        if(processosExists){
            return res.status(500).json({message: "Requisição Existente"})
        }else{
            try {
                const processo = await Processos.create({
                    tipo,
                    nome,
                    email,
                    cpf,
                    id_req,
                    obras,
                    comments
                })
                req.processo_id = processo._id
                return next()

            } catch (error) {
                return res.status(400).json({message: error.message})
            }
        }
    },
    async updateObras(obrasColetadas, processo_id){
        console.log("Updating")
        const processo = await Processos.findById(processo_id)
        obrasColetadas.forEach(element => {
            processo.obras.push(element)
        });
        processo.status = "Obras Encontradas"
        const updated = await processo.save()
        console.log("Updated")
    },
    async updateObras(processo_id){
        console.log("Updating")
        const processo = await Processos.findById(processo_id)
        processo.status = "Obras não Encontradas"
        const updated = await processo.save()
        console.log("Updated")
    },
    async find(req, res){
        const {chave, valor} = req.params;
        Processos.find({[chave]:valor}, (err, result)=>{
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

        await Processos.paginate({}, options, (err, result)=>{
            if(err){
                return res.status(400).json({message: "Bad Request"});                
            }else{
                return res.json(result)
            }
        })
    }
};
