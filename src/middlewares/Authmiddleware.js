require('dotenv').config();
let jwt = require('jsonwebtoken');
const config = process.env.JWT_SECRET
const Perfil = require('../models/Perfil');

let checkToken = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization'];
  if (token) {
      if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
      }
      jwt.verify(token, config, (err, decoded) => {
      if (err) {
        return res.json({
            success: false,
            message: 'Token is not valid'
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.json({
      success: false,
      message: 'Auth token is not supplied'
    });
  }
};

async function checkPro(req, res, next) {
  const {profile_id} = req.decoded;
  const {papel} = await Perfil.findById(profile_id).exec();

  if (papel === "pro") {
    return next()
  }
  return res.json({
      success: false,
      message: 'Token not Authorized'
    });
}

module.exports = {
  checkToken: checkToken,
  checkPro: checkPro

}
