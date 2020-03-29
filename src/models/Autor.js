const {Schema} = require('mongoose');

const autorSchema = new Schema({
    _id:false,
    cpf_autor:Number,
    nome_autor:String,
    participacao:Number
})

module.exports = autorSchema;
