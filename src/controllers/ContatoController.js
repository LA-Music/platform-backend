const Contato = require('../models/Contato');

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
    }
};
