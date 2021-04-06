const {Schema, model} = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');

const mailOptions = {
    to: user.email,
    from: process.env.REMETENTE_EMAIL,
    subject: "Pedido de troca de senha",
    template: 'linkTrocaSenha',
    context: {
        titulo: "PEDIDO DE TROCA DE SENHA",
        nome: user.nome,
        link: link
    },
};   

const emailSchema = new Schema({
    remetente:{
        type:String,
        required:true
    },
    destinatario:{
        type:String,
        required:true
    },
    options:[],
    template:Number,
    status:Number
})
emailSchema.plugin(mongoosePaginate)
module.exports = model('Email', emailSchema);

