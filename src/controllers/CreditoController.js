const Credito = require('../models/Credito');

module.exports = {
    async store(req, res){
        const { nome,email,cpf,telefone,nome_artistico,associacao,redes_sociais,lista_musicas } = req.body
        const status = 0
        const creditoExists = await Credito.findOne({
                $and:[{nome},{status}]
            })
        if(creditoExists){
            console.log(creditoExists);
            return res.status(500).json({message: "Requisição Existente"})
        }else{
            try {
                await Credito.create({
                    nome,
                    email,
                    cpf,
                    telefone,
                    nome_artistico,
                    associacao,
                    redes_sociais,
                    lista_musicas,
                    status
                })    
                return res.status(200).json({message: "ok"})

            } catch (error) {
                return res.status(400).json({message: error.message})
            }
        }
    }
};
