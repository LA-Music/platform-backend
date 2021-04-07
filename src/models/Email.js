const {Schema, model} = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');

const emailSchema = new Schema({
    mailOptions:{},
    status:String
},{timestamps:true})

emailSchema.plugin(mongoosePaginate)
module.exports = model('Email', emailSchema);

