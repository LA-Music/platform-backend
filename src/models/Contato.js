const {Schema, model} = require('mongoose');

const ContatoSchema = new Schema({
    nome:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
    },
    assunto: String,
    mensagem: String,
    tipo: {
        type: Number,
        required: true
    },
    status: Number
},{timestamps:true});

module.exports = model('Contato', ContatoSchema);