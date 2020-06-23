const {Schema, model} = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
var obraSchema = new Schema({
    codEcad:String, 
    titulo:String, 
    autores:String, 
    interprete:String,
    competencia:String,
    faixa:String,
    motivo:String,
    execucao:String
})
var commentSchema = new Schema({
    msg:String,
    autor:String
})
const ProcessosSchema = new Schema({
    status:{
        type: String,
        required:true,
        default:"Buscando Obras"
    },
    tipo:{
        type:String,
        required:true,
        default:"credito",
        enum:["credito", "contato", "marca", "musica"],
    },
    nome:{
       type:String,
       required: true
    },
    email:String,
    id_req:{
        type:Schema.Types.ObjectId,
        required:true
    },
    cpf_cliente:String,
    obras:[obraSchema],
    comments:[commentSchema]
},{timestamps:true});
ProcessosSchema.plugin(mongoosePaginate)
module.exports = model('Processos', ProcessosSchema);