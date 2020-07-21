require('dotenv').config()
const Perfil = require('../models/Perfil')
const jwt = require('jsonwebtoken')

module.exports = {
    async store(req, res){
        const { nome, email, senha, cpf, telefone} = req.body
        const status = 0
        const papel = "user"
        const usuarioExists = await Perfil.findOne({
                $and:[{email}]
            })
        if(usuarioExists){
            return res.status(500).json({message: "Email não disponível"})
        }else{
            try {
                await Perfil.create({
                    nome,
                    email,
                    senha,
                    papel,
                    cpf,
                    telefone
                })
                return res.status(200).json({message: "ok"})
            } catch (error) {
                return res.status(400).json({message: error.message})
            }
        }
    },
    async find(req, res){
        const {profile_id} = req.decoded;
        console.log(profile_id)
        Perfil.find({_id:profile_id}, (err, result)=>{
            if(err || !result.length){
                return res.status(400).json({message: "Bad Request"});
            }else{
                // Todo refactorar para findById
                const resultado = result[0]
                return res.json({id:resultado._id, papel:resultado.papel, email: resultado.email, nome: resultado.nome })
            }
        })
    },
    async createToken(req, res){
        const {email, senha} = req.body
        Perfil.authenticate(email, senha, function (error, perfil) {
        if (error || !perfil) {
          return res.status(400).json({message: 'Email ou senha errada'})
        } else {
          const profile_id = perfil._id
          const secret = process.env.JWT_SECRET
          const token = jwt.sign({profile_id},secret,{
              expiresIn: 86400
          })
          return res.send({token, papel: perfil.papel, nome:perfil.nome})
        }
        });
    },
    async findAll(req, res){
    // todo
      return res.send({msg:"to-do"})
    }
};
