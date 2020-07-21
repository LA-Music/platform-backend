const {Schema, model} = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
const bcrypt = require('bcrypt')

const PerfilSchema = new Schema({
    nome:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true
    },
    cpf:{
      type: String,
      required: true
    },
    telefone:{
      type: String,
      required: false
    },
    senha:{
        type: String,
        required: true,
    },
    url:String,
    papel:{
      type:String,
      default:"user",
      enum:["user", "admin", "superadmin"],
      required:true
    }
},{timestamps:true});

PerfilSchema.statics.authenticate = function (email, senha, callback) {
  Perfil.findOne({ email: email })
    .exec(function (err, perfil) {
      if (err) {
        return callback(err)
      } else if (!perfil) {
        var err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
      bcrypt.compare(senha, perfil.senha, function (err, result) {
        if (result === true) {
          return callback(null, perfil);
        } else {
          return callback();
        }
      })
    });
}

PerfilSchema.pre('save', function (next) {
  var perfil = this;
  bcrypt.hash(perfil.senha, 10, function (err, hash){
    if (err) {
      return next(err);
    }
    perfil.senha = hash;
    next();
  })
});

PerfilSchema.plugin(mongoosePaginate)
var Perfil = model('Perfil', PerfilSchema);
module.exports = Perfil;
