const Processos = require('../models/Processos');
var nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars')
require('dotenv').config()

module.exports = {
    async store(req, res, next){
        // const { tipo, nome, email, cpf, obras, comments} = req.body
        // const id_req = req.credito_id
        // const id_perfil = req.id_perfil
        // const processosExists = await Processos.findOne({
        //         $and:[{id_req},{nome}]
        //     })
        // if(processosExists){
        //     return res.status(500).json({message: "Requisição Existente"})
        // }else{
            try {
                 const { tipo, nome, email, cpf} = req.body
                //  console.log("BODY:"+JSON.stringify(req.body))
                 const id_req = req.credito_id
                 const id_perfil = req.id_perfil
                //  console.log("REQ ID:"+id_req)
                //  console.log("NOME:"+nome)
                const processo = await Processos.create({                    
                    nome:nome,
                    email:email,
                    cpf:cpf,
                    id_req:id_req,
                    id_perfil:id_perfil
                })
                req.processo_id = processo._id
                return next()

            } catch (error) {
                return res.status(400).json({processomessage: error.message})
            }
        // }
    },
    async updateObras(obrasColetadas, processo_id){
        // console.log("Updating Obras")
        const processo = await Processos.findById(processo_id)
        obrasColetadas.forEach(element => {
            processo.obras.push(element)
        });
        processo.status = "Obras Encontradas"
        const updated = await processo.save()
        // console.log("Obras Updated")
    },
    async updateStatus(processo_id, status){
        // console.log("Updating Status")
        const processo = await Processos.findById(processo_id)
        processo.status = status
        const updated = await processo.save()
        // console.log("Status Updated")
    },
    async updateFonogramas(fonogramasColetados, processo_id){
        // console.log("Atualizando Fonogramas: "+processo_id)
        const processo = await Processos.findById(processo_id)
        fonogramasColetados.forEach(element => {
            processo.fonogramas.push(element)
        });
        processo.status_fonograma = "Fonogramas Encontrados"
        const updated = await processo.save()
        // console.log("Fonogramas Atualizados")
    },
    async updateStatusFonogramas(processo_id, status){
        // console.log("Updating Status Fonogramas")
        const processo = await Processos.findById(processo_id)
        processo.status_fonograma = status
        const updated = await processo.save()
        // console.log("Status Updated")
    },
    async find(req, res){
        const {chave, valor} = req.params;
        Processos.find({[chave]:valor}, (err, result)=>{
            if(err || !result.length){
                return res.status(400).json({message: "Bad Request"});                
            }else{
                return res.json(result)
            }
        })
    },
    async findProcesso(req, res){
        const email = req.email
        Processos.find({email}, (err, result)=>{
            if(err){
                return res.status(400).json({message: "Bad Request"});                
            }else{
                return res.status(200).json(result)
            }
        })
    },
    async findAll(req, res){
        const { page } = req.params
        const options = {
            page,
            sort: { createdAt: -1},
            limit: process.env.PAGINATION_LIMIT
        }

        await Processos.paginate({}, options, (err, result)=>{
            if(err){
                return res.status(400).json({message: "Bad Request"});                
            }else{
                result.docs = result.docs.map(element => {
                    return {
                        _id:element._id,
                        nome:element.nome,
                        tipo:element.tipo,
                        id_req:element.id_req,
                        obras:element.obras,
                        comments:element.comments,
                        email:element.email,
                        status:element.status,
                        status_fonograma:element.status_fonograma,
                        reviewed:element.reviewed,
                        fonogramas:element.fonogramas,
                        createdAt:element.createdAt.toLocaleString(),
                        cadastro_Abrammus: element.cadastro_Abrammus
                    }
                });
                return res.json(result)
            }
        })
    }
    ,
    async findAllNext(req, res, next){
        const { page } = req.params
        const options = {
            page,
            sort: { createdAt: -1},
            limit: process.env.PAGINATION_LIMIT
        }

        await Processos.paginate({}, options, (err, result)=>{
            if(err){
                return res.status(400).json({message: "Bad Request"});                
            }else{
                result.docs = result.docs.map(element => {
                    return {
                        _id:element._id,
                        nome:element.nome,
                        tipo:element.tipo,
                        id_req:element.id_req,
                        obras:element.obras,
                        comments:element.comments,
                        email:element.email,
                        status:element.status,
                        status_fonograma:element.status_fonograma,
                        reviewed:element.reviewed,
                        fonogramas:element.fonogramas,
                        createdAt:element.createdAt.toLocaleString()}
                });
                req.result = result
                return next()
            }
        })
    },
    async findObras(req, res, next){
        Processos.find({"status":"Buscando Obras"}, (err, result)=>{
            if(err || !result.length){
                return res.status(400).json({message: err || result.length});                
            }else{
                req.result = result
                return next()
            }
        })
    },
    async findFonogramas(req, res, next){
        Processos.find({"status_fonograma":"Buscando Fonogramas"}, (err, result)=>{
            if(err || !result.length){
                return res.status(400).json({message: err || result.length});                
            }else{
                req.result = result
                return next()
            }
        })
    },
    async checkProcesso(req, res){
        const {processo_id, check_value} = req.body    
        const processo = await Processos.findById(processo_id)
        processo.reviewed = check_value
        const updated = await processo.save()
        return res.status(200).json({processo})
    },
    async updateCadastroAbrammus(processo_id, value){    
        const processo = await Processos.findById(processo_id)
        processo.cadastro_Abrammus = value
        const updated = await processo.save()
        // console.log("Status Updated")
    },
    async findProcessoById(req, res, next){
        const { processo_id } = req.body
        const result = await Processos.findById(processo_id)
        req.result = result
        return next()
    },
    async findProcessoById(req, res, next){
        const { processo_id } = req.body
        const result = await Processos.findById(processo_id)
        req.result = result
        return next()
    },
    async obrasAutoria(req, res, next){
        try {
            const { processo_id, obras } = req.body
            const result = await Processos.findById(processo_id)
            obras.forEach(obra => {
                result.obras[result.obras.findIndex(el=>el.id === obra._id)].status = obra.status
            })
            await result.save()
            return next()
            return res.status(200).json({message:"ok"})
            
        } catch (error) {
            return res.status(400).json({error})        
        }
    },
    async fonogramasAutoria(req, res, next){
        try {
            const { processo_id, fonogramas } = req.body
            const result = await Processos.findById(processo_id)
            fonogramas.forEach(fonograma => {
                result.fonogramas[result.fonogramas.findIndex(el=>el.id === fonograma._id)].status = fonograma.status
            })
            await result.save()
            return next()

            return res.status(200).json({message:"ok"})
            
        } catch (error) {
            return res.status(400).json({error})        
        }
    },
    async contratarObras(req,res,next){    
        // Colocar um passo anterior que obtem os dados do Perfil
        const perfil = req.perfil
        const { processo_id } = req.body
        // Listar obras e fonogramas com status = 'contratado'
        
        const result = await Processos.findById(processo_id).lean()
        if(result){
        const obras = result.obras.filter(obra => obra.status === "contratado");
        if(obras){
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.REMETENTE_EMAIL,
                    pass: process.env.REMETENTE_SENHA
                }
            });
            // send email
            transporter.use('compile', hbs({
                viewEngine: {
                    extName: '.hbs',
                    partialsDir: 'views',//your path, views is a folder inside the source folder
                    layoutsDir: 'views',
                    defaultLayout: ''//set this one empty and provide your template below,
                },
                viewPath: 'views'
            }))
            const mailOptions = {
                to: ['matheus@lamusic.com.br','michelle@lamusic.com.br', 'contato@lamusic.com.br', 'lucasleitegoncalves@gmail.com'],
                // to: ['matheuscmilo@gmail.com'],
                from: process.env.FROM_EMAIL,
                subject: "Contratar LA Pro",
                template: "contratarPro",
                context: {
                    titulo: "PEDIDO DE CONTRATAÇÃO",
                    perfil:perfil,
                    result:result,
                    lista:obras,
                    objeto:"Obras"
                }
            };                        
            
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    res.status(500).json({error})
                }
            });
        }  
        }              
        return res.status(200).json({message:"ok"})
        },
        async contratarFonogramas(req,res,next){    
            // Colocar um passo anterior que obtem os dados do Perfil
            const perfil = req.perfil
            const { processo_id } = req.body
            // Listar fonogramas e fonogramas com status = 'contratado'
            const result = await Processos.findById(processo_id).lean()
            if(result){
                const fonogramas = result.fonogramas.filter(fonograma => fonograma.status === "contratado");
                if(fonogramas){
                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: process.env.REMETENTE_EMAIL,
                            pass: process.env.REMETENTE_SENHA
                        }
                    });
                    // send email
                    transporter.use('compile', hbs({
                        viewEngine: {
                            extName: '.hbs',
                            partialsDir: 'views',//your path, views is a folder inside the source folder
                            layoutsDir: 'views',
                            defaultLayout: ''//set this one empty and provide your template below,
                        },
                        viewPath: 'views'
                    }))
                    const mailOptions = {
                        to: ['matheus@lamusic.com.br','michelle@lamusic.com.br', 'contato@lamusic.com.br', 'lucasleitegoncalves@gmail.com'],
                        // to: ['matheuscmilo@gmail.com'],
                        from: process.env.FROM_EMAIL,
                        subject: "Contratar LA Pro",
                        template: "contratarPro",
                        context: {
                            titulo: "PEDIDO DE CONTRATAÇÃO",
                            perfil:perfil,
                            result:result,
                            lista:fonogramas,
                            objeto:"Fonogramas"
                        }
                    };                        
                    
                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                            res.status(500).json({error})
                        }
                    });
                }                
            }
            return res.status(200).json({message:"ok"})
            },
        
        async listProcesso(req,res,next){    
            
            const { processo_id } = req.body
            console.log(processo_id)
            // Listar obras e fonogramas com status = 'contratado'
            
            const result = await Processos.findById(processo_id)
            const obras = result.obras.filter(obra => obra.status === "contratado");
            
        return res.status(200).json({result})
        
    },
};
