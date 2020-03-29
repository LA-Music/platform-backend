const {Schema, model} = require('mongoose');

const marcaSchema = new Schema({
    email:{
        type:String,
        required:true
    },
    nome:{
        type:String,
        required:true
    },
    telefone:{
        type:String,
        required:true
    },
    cpf:{
        type:Number,
        required:true
    },
    cpf_comprovante_path:{
        type:String,
        required:true
    },
    descricao:{
        type:String,
        required:true
    },
    logo_path:{
        type:String,
        required:true
    },
    sintese_marca:{
        type:String,
        required:true
    },
    status:Number
})

module.exports = model('Marca', marcaSchema);

