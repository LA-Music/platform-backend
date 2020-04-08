const Musica = require('../models/Musica');
require('dotenv').config()

module.exports = {
    async store(req, res){
        const { nome, autores, subtitulo,estilo,letra,duracao,interprete,feat } = req.body
        const status = 0
                
        const musicaExists = await Musica.findOne({
                $and:[{nome}, {autores}]
            })
        if(musicaExists){
            return res.status(500).json({message: "Musica Existente"})
        }else{
            try {
                await Musica.create({
                    nome,
                    subtitulo,
                    estilo,
                    letra,
                    duracao,
                    autores,
                    interprete,
                    feat,
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
        Musica.find({[chave]:valor}, (err, result)=>{
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

        await Musica.paginate({}, options, (err, result)=>{
            if(err){
                return res.status(400).json({message: "Bad Request"});                
            }else{
                return res.json(result)
            }
        })
    }
};
