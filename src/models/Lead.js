const {Schema, model} = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');

const LeadSchema = new Schema({
    nome:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
    },
    cpf:{
        type: String
    },
    telefone:String,
    completou:Boolean,
},{timestamps:true});
LeadSchema.plugin(mongoosePaginate)
module.exports = model('Lead', LeadSchema);