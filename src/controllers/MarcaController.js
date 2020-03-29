const Marca = require('../models/Marca');

module.exports = {
    async store(req, res){
        const status = 0
        const { email,nome,telefone,cpf,cpf_comprovante_path,descricao,logo_path,sintese_marca } = req.body
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
};
