const {Schema, model} = require('mongoose');

const CreditoSchema = new Schema({
    nome:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
    },
    cpf:{
        type: Number,
        required: true,
    },
    telefone:String,
    nome_artistico:String,
    associacao:String,
    redes_sociais:[String],
    lista_musicas:[String],
    status: Number
},{timestamps:true});

module.exports = model('Credito', CreditoSchema);