const {Schema, model} = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');

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
marcaSchema.plugin(mongoosePaginate)
module.exports = model('Marca', marcaSchema);

