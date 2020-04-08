const {Schema, model} = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');

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
ContatoSchema.plugin(mongoosePaginate)
module.exports = model('Contato', ContatoSchema);