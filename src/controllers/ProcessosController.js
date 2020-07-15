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
        console.log("Updating Obras")
        const processo = await Processos.findById(processo_id)
        obrasColetadas.forEach(element => {
            processo.obras.push(element)
        });
        processo.status = "Obras Encontradas"
        const updated = await processo.save()
        console.log("Obras Updated")
    },
    async updateStatus(processo_id){
        console.log("Updating Status")
        const processo = await Processos.findById(processo_id)
        processo.status = "Obras não Encontradas"
        const updated = await processo.save()
        console.log("Status Updated")
    },
    async updateFonogramas(fonogramasColetados, processo_id){
        console.log("Atualizando Fonogramas: "+processo_id)
        const processo = await Processos.findById(processo_id)
        fonogramasColetados.forEach(element => {
            processo.fonogramas.push(element)
        });
        processo.status_fonograma = "Fonogramas Encontrados"
        const updated = await processo.save()
        console.log("Fonogramas Atualizados")
    },
    async updateStatusFonogramas(processo_id, status){
        console.log("Updating Status Fonogramas")
        const processo = await Processos.findById(processo_id)
        processo.status_fonograma = status
        const updated = await processo.save()
        console.log("Status Updated")
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
            sort: { createdAt: -1},
            limit: process.env.PAGINATION_LIMIT
        }

        await Processos.paginate({}, options, (err, result)=>{
            if(err){
                return res.status(400).json({message: "Bad Request"});                
            }else{
                result.docs = result.docs.map(element => {
                    return {
                        _id:element._id,
                        nome:element.nome,
                        tipo:element.tipo,
                        id_req:element.id_req,
                        obras:element.obras,
                        comments:element.comments,
                        email:element.email,
                        status:element.status,
                        createdAt:element.createdAt.toLocaleString()}
                });
                return res.json(result)
            }
        })
    }
    ,
    async findAllNext(req, res, next){
        const { page } = req.params
        const options = {
            page,
            sort: { createdAt: -1},
            limit: process.env.PAGINATION_LIMIT
        }

        await Processos.paginate({}, options, (err, result)=>{
            if(err){
                return res.status(400).json({message: "Bad Request"});                
            }else{
                result.docs = result.docs.map(element => {
                    return {
                        _id:element._id,
                        nome:element.nome,
                        tipo:element.tipo,
                        id_req:element.id_req,
                        obras:element.obras,
                        comments:element.comments,
                        email:element.email,
                        status:element.status,
                        status_fonograma:element.status_fonograma,
                        fonogramas:element.fonogramas,
                        createdAt:element.createdAt.toLocaleString()}
                });
                req.result = result
                return next()
            }
        })
    }
};
