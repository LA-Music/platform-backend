const Musica = require('../models/Musica');

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
    }
};
