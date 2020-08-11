const {Schema, model} = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');

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
        type: String,
        required: true,
    },
    telefone:String,
    nome_artistico:String,
    associacao:String,
    redes_sociais:[String],
    lista_musicas:[String],
    papel:{
        type:String,
        default:"artista",
        enum:["artista", "produtor"],
        required:true
    },
    nome_produtor:String,
    // email_produtor:String,
    telefone_produtor:String,
    status: Number
},{timestamps:true});
CreditoSchema.plugin(mongoosePaginate)
module.exports = model('Credito', CreditoSchema);