require('dotenv').config();
const jwt = require('jsonwebtoken')

const mockUsername = 'admin'
const mockPassword = 'admin'

module.exports = {
    async login(req, res){
        const {username, password} = req.body
        if(username == mockUsername){
            if(password == mockPassword){
                const secret = process.env.JWT_SECRET
                const token = jwt.sign({username},secret,{
                    expiresIn: 86400
                })
                return res.send({token})
            }
        }
        return res.status(400).json({message: 'Unable to authenticate'})
    },
    async register(req,res){
        return res.json({message:'To-do'})
    }
};