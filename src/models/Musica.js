const {Schema, model} = require('mongoose');
const Autor = require('./Autor')
var mongoosePaginate = require('mongoose-paginate-v2');

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
MusicaSchema.plugin(mongoosePaginate)
module.exports = model('Musica', MusicaSchema);