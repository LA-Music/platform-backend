const {Schema, model} = require('mongoose');
const Autor = require('./Autor')

const MusicaSchema = new Schema({
    nome:{
        type: String,
        required: true
    },
    subtitulo:String,
    estilo:{
        type: String,
        required: true
    },
    letra:String,
    duracao:{
        type: String
    },
    autores:[Autor],
    taxa_administracao:String,
    data_contrato:String,
    interprete:[String],
    feat:[String],
    status: Number
},{timestamps:true});

module.exports = model('Musica', MusicaSchema);