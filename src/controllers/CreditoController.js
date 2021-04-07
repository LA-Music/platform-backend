const Credito = require('../models/Credito');
const Lead = require('../models/Lead');
const moment = require('moment');
const mailer = require('../services/Mailer')

const createCsvWriter = require('csv-writer').createObjectCsvWriter;

require('dotenv').config()

function parseTimeline(xs, key){
    return xs.reduce(function(rv, x) {                
        (rv[x[key]] = (rv[x[key]] || 0)+1);
    return rv;
    }, {});
}

module.exports = {
    
    async store(req, res, next){
        const { nome,email,cpf,telefone,nome_artistico,associacao,redes_sociais,lista_musicas,papel,nome_produtor,email_produtor,telefone_produtor,id_perfil,lead_id } = req.body
        const status = 0
            try {
                const credito = await Credito.create({
                    nome,
                    email,
                    cpf,
                    telefone,
                    pseudonimos:nome_artistico,
                    associacao,
                    redes_sociais,
                    lista_musicas,
                    status,
                    papel,
                    nome_produtor,
                    email_produtor,
                    telefone_produtor,
                    id_perfil
                })
                req.credito_id = credito._id
                req.id_perfil = id_perfil
                
                if(lead_id){
                    try {
                        const lead = await Lead.findById(lead_id)
                        lead.completou = true
                        const updated = await lead.save()    
                    } catch (error) {
                        
                    }
                }                
                
                const mailOptions = {
                    // to:'matheuscmilo@gmail.com',
                    to: email,
                    from: process.env.REMETENTE_EMAIL,
                    subject: "Relatório solicitado com sucesso!",
                    template: 'consulta',
                    context: {
                        titulo: "RELATÓRIO SOLICITADO COM SUCESSO",
                        nome,
                        cpf,
                        telefone,
                        associacao,
                        nome_produtor
                    },
                };
                mailer.send(mailOptions)

                
                    const assunto = "Credito Retido"
                    const mensagem = `<h1>Novo Credito Retido</h1> <ul><li><b>Id:</b>${req.credito_id}</li><li><b>Nome:</b>${req.body.nome}</li><li><b>Email:</b>${req.body.email}</li><li><b>Cpf:</b>${req.body.cpf}</li><li><b>Telefone:</b>${req.body.telefone}</li><li><b>Nome Artístico:</b>${req.body.nome_artistico}</li><li><b>Associação:</b>${req.body.associacao}</li></ul>`
                    var maillist = [
                        'luiz@lamusic.com.br',
                        'rangel@lamusic.com.br',
                        'matheus@lamusic.com.br'
                    ];  

                    mailOptions = {
                        from: process.env.REMETENTE_EMAIL,
                        to: maillist,
                        subject: assunto,
                        html: mensagem
                    };

                mailer.send(mailOptions)
                
                return next()
               
            } catch (error) {
                return res.status(400).json({message: error.message})
            }
    },
    async storeLead(req, res, next){
        const { nome,email,cpf,telefone,nome_produtor} = req.body
            try {
                const lead = await Lead.create({
                    nome,
                    email,
                    cpf,
                    telefone,
                    nome_produtor,
                    completou:false,
                })   
                res.status(200).json({lead_id:lead._id});
            } catch (error) {
                return res.status(400).json({message: error.message})
            }
    },    
    async find(req, res){
        const {chave, valor} = req.params;
        Credito.find({[chave]:valor}, (err, result)=>{
            if(err || !result.length){
                return res.status(400).json({message: "Bad Request"});                
            }else{
                return res.json(result)
            }
        })
    },
    async findCredito(req, res){
        const email = req.email        
        Credito.find({email}, (err, result)=>{
            if(err){
                return res.status(400).json({message: "Bad Request"});                
            }else{
                return res.json(result)
            }
        })
    },
    async findPaginate(req, res){
        const { page } = req.params
        const options = {
            page,
            sort: { createdAt: -1},
            limit: 500
        }

        await Credito.paginate({}, options, (err, result)=>{
            if(err){
                return res.status(400).json({message: "Bad Request"});                
            }else{
                result.docs = result.docs.map(element => {
                    return {_id:element._id,nome:element.nome,email:element.email,
                        cpf:element.cpf,telefone:element.telefone,nome_artistico:element.nome_artistico,
                        associacao:element.associacao,status:element.status,createdAt:element.createdAt.toLocaleString(),
                        nome_produtor:element.nome_produtor, telefone_produtor:element.telefone_produtor, 
                        redes_sociais: element.redes_sociais, lista_musicas: element.lista_musicas, pseudonimos:element.pseudonimos
                    }
                });
                
                return res.json(result)
            }
        })
    },
    async timeline(req, res){
        
        const options = {            
            sort: { createdAt: -1},
            limit:600
        }

        await Credito.paginate({}, options, (err, result)=>{
            if(err){
                return res.status(400).json({message: "Bad Request"});                
            }else{
                result = result.docs.map(element => {
                    return {_id:element._id, nome:element.nome, createdAt:moment(element.createdAt).format('YYYY-MM-DD')}
                });                
                // console.log(parseTimeline(result.docs,"createdAt"))
                return res.json(parseTimeline(result,"createdAt"))
            }
        })
    },
    async listEmails(req, res){
        
        const options = {            
            sort: { email: 1},
            limit:1000
        }
        const csvWriter = createCsvWriter({
            path: './emails.csv',
            header: [
                    {id: 'email', title: 'EMAILS'}
            ]
        });
        await Credito.paginate({}, options, (err, result)=>{
            if(err){
                console.log(err)
                return res.status(400).json({message: "Bad Request"});                
            }else{
                records = result.docs.map(element => {
                    return {email: element.email}
                }); 

                csvWriter.writeRecords(records.filter((value, index) => records.indexOf(value) === index))
                .then(() => {
                    console.log('...Done');
                });
                return res.json({records})
            }
        })
    },
    async findById(req, res, next){
        const { id_req } = req.result
        const result = await Credito.findById(id_req)
        
        req.credito = result
        return next()
    },
};
