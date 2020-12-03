require('dotenv').config()
const puppeteer = require('puppeteer');
const ProcessoController = require('../controllers/ProcessosController')

// Todo -- pegar o nome pelo cpf
// Verificar se ja foi solicitado

const Obras = []
const Fonogramas = []

function parseSolicitar(obras){
  let arrStr = obras.match("Solicitar")
  return arrStr
}

function parseCod(obras){
  let arrStr = obras.match(/(?<=Ecad)(.*?)(?=\s*Título)/g);
  return arrStr
}

function parseAutores(obras){
  let arrStr = obras.match(/(?<=Autores)(.*?)(?=\s*Faixa)/g);
  return arrStr
}

function parseTitulo(obras){
  let arrStr = obras.match(/(?<=Título)(.*?)(?=\s*Intérprete)/g);
  return arrStr
}

function parseInterprete(obras){
  let arrStr = obras.match(/(?<=Intérprete)(.*?)(?=\s*Competência)/g);
  return arrStr
}

function parseCompetencia(obras){
  let arrStr = obras.match(/(?<=Competência)(.*?)(?=\s*Autores)/g);
  return arrStr
}

function parseFaixa(obras){
  let arrStr = obras.match(/(?<=Faixa)(.*?)(?=\s*Classificação)/g);
  return arrStr
}

function parseMotivo(obras){
  let arrStr = obras.match(/(?<=Motivo)(.*?)(?=\s*Execuções)/g);
  return arrStr
}

function parseExecucao(obras){
  let arrStr = obras.match(/(?<=Execuções)(.*?)(?=\s*Usado)/g);
  return arrStr
}

function parseExecucao1(obras){
  let arrStr = obras.match(/(?<=Execuções)(.*?)(?=\s*Solicitar)/g);
  return arrStr
}

function parsePseudonimos(obras){
  let arrStr = obras.match(/(?<=Pseudônimos)(.*)/g);
  return arrStr[0]
}

function parseCPFandPseudonimos(obras, cpf){
  let searchString = "(?<=CPF"+cpf+")(.*)"
  var regex = new RegExp( searchString, 'g' );
  let arrStr = obras.match(regex);
  return arrStr[0]
}

function filterDate(competencia){
  let d = new Date()
  let month = d.getMonth() + 1
  let year = d.getFullYear()

  let competenciaParsed = competencia.split("/")
  let competenciaMonth = competenciaParsed[0]
  let competenciaYear = competenciaParsed[1]
  
  if(year - competenciaYear < 5){
    return true    
  }else if(year - competenciaYear === 5){
    if(month < competenciaMonth){
      return true
    }
  }
  return false
}

function parseAll(Obras, value){
  // To do - Refactor Parse as a service...
  const codEcad = parseCod(value)
  const titulo = parseTitulo(value)
  const interprete = parseInterprete(value)
  const competencia = parseCompetencia(value)
  const faixa = parseFaixa(value)
  const motivo = parseMotivo(value)
  const execucao = parseExecucao(value)
  const autores = parseAutores(value)
  for (let index = 0; index < codEcad.length; index++) {
    if(!motivo[index].includes("BLOQUEADA") && filterDate(competencia[index])){
      Obras.push({codEcad:codEcad[index], titulo:titulo[index],interprete: interprete[index], 
        competencia: competencia[index],faixa: faixa[index], motivo: motivo[index], 
        execucao:(execucao ? execucao[index] : parseExecucao1(value)[index]), autores: autores[index]})
    }
  }  
}

async function AbrammusPuppet(autor, processo_id) {
  console.log("Scraping Obras... Autor: "+autor.nome)
  const browser = await puppeteer.launch({
    defaultViewport: null,
    args: ['--enable-features=NetworkService','--no-sandbox'],
    ignoreHTTPSErrors: true
  });
  
  const page = await browser.newPage();
  
  await page.setViewport({
    width: 1920,  
    height: 1080
})

  await page.goto('https://portal.abramus.org.br/portal');

  await page.type("#username", process.env.ABRAMMUS_EMAIL)
  await page.type("#password", process.env.ABRAMMUS_SENHA)
  
  await Promise.all([
    page.waitForNavigation(),
    page.click("#kc-login")
  ])
  // Etapa 1
  await page.goto('https://portal.abramus.org.br/portal/v/repertorio/consultarTitular.faces');
  await page.waitForSelector("#consultarTitularFrm\\:edtSearch", {visible: true})
  await page.type("#consultarTitularFrm\\:edtSearch", autor.nome)
  await page.click("#consultarTitularFrm\\:btnBuscar")
  await page.waitForSelector("#consultarTitularFrm\\:j_idt148\\:0\\:conteudoFicha",{visible:true})
  
  // Coleta a tabela de resultados
  let element = await page.$('#consultarTitularFrm\\:j_idt148_data')
  let value = await page.evaluate(el => el.textContent, element)
  
  // Verifica se o cpf esta presente nos resultados
  const cpf = autor.cpf.replace(/\D/g,'');
  if(!value.includes(`CPF${cpf}`)){
    console.log("CPF nao encontrado")
    await ProcessoController.updateCadastroAbrammus(processo_id,false)
    await browser.close();
    return 0
  }
  await ProcessoController.updateStatus(processo_id, "Buscando Obras")

  await ProcessoController.updateCadastroAbrammus(processo_id,true)  
  console.log("CPF encontrado")
  // Procura a linha de texto do cpf de interesse
  let cpfText = parseCPFandPseudonimos(value, cpf)
  // Recupera os pseudonimos da linha do cpf
  const pseudonimos = parsePseudonimos(cpfText)
  console.log(`CPF: ${cpf}`)
  const pseudonimosList = pseudonimos.split("/")
  console.log(`Pseudonimos: ${pseudonimosList}`)
  
  // Etapa 2
  await page.goto('https://portal.abramus.org.br/portal/v/naoIdentificado/identificarObra.faces');
  await page.click("#form\\:movieBtn1")
  
  // Busca Obras por Nome
  await page.waitForSelector("#form\\:autor", {visible: true})
  await page.type("#form\\:autor", autor.nome)
  await page.click("#form\\:j_idt136")
  await ProcessoController.updateStatus(processo_id, "Obras não Encontradas")
  
  try {
    await page.waitForSelector("#form\\:j_idt151", {visible: true})
    let element = await page.$('#form\\:listasolr_data')
    let value = await page.evaluate(el => el.textContent, element)
    parseAll(Obras, value)          
    // await page.screenshot({path: 'BuscaNome.png'});
  } catch (error) {
    try {
      await page.waitForSelector(".alert.alert-warning.msg-warning", {visible:true})
      await ProcessoController.updateStatus(processo_id, "Abrammus Atualizando")
    } catch (error) {
      console.log("Erro: Obras não encontradas")
    }
    console.log("Erro: Obras não encontradas Nome")
  }

  // Busca Obras por Pseudonimos
  for (const iterator of pseudonimosList) {
    console.log(`Pseudonimo ${iterator}`)
    await page.goto('https://portal.abramus.org.br/portal/v/principal.faces');
    
    await page.goto('https://portal.abramus.org.br/portal/v/naoIdentificado/identificarObra.faces');
    
    await page.click("#form\\:movieBtn1")
    await page.waitForSelector("#form\\:autor", {visible: true})
    await page.type("#form\\:autor", iterator)
    await page.click("#form\\:j_idt136")
  
    try {
      await page.waitForSelector("#form\\:j_idt151", {visible: true})
      // await page.screenshot({path: `Busca-${iterator}.png`});
    
      let element = await page.$('#form\\:listasolr_data')
      let value = await page.evaluate(el => el.textContent, element)      
      parseAll(Obras, value)
          
    } catch (error) {
      
      console.log("Erro: Obras não encontradas Pseudonimo")      
    }  
  }

  const filteredObras = Obras.reduce((acc, current) => {
    const x = acc.find(item => item.codEcad === current.codEcad && item.titulo === current.titulo && item.interprete === current.interprete && item.competencia === current.competencia
      && item.faixa === current.faixa && item.motivo === current.motivo && item.execucao === current.execucao && item.autores === current.autores);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);
  if (filteredObras.length>0){
    await ProcessoController.updateObras(filteredObras, processo_id)
  }
    
  // Etapa 3 Buscar Fonogramas
  await page.goto('https://portal.abramus.org.br/portal/v/principal.faces');
  await ProcessoController.updateStatusFonogramas(processo_id, "Buscando Fonogramas")

  await page.goto('https://portal.abramus.org.br/portal/v/naoIdentificado/identificarFonograma.faces');
  await page.click("#form\\:movieBtn1")
  await page.waitForSelector("#form\\:interprete", {visible: true})
  await page.type("#form\\:interprete", autor.nome)
  await page.click("#form\\:j_idt136")
  await ProcessoController.updateStatusFonogramas(processo_id, "Fonograma não Encontrado")
  console.log("Buscando Fonogramas "+autor.nome)
  try {
    await page.waitForSelector("#form\\:j_idt151", {visible: true})
    let elementFono = await page.$('#form\\:listasolr_data')
    let valueFono = await page.evaluate(el => el.textContent, elementFono)
    parseAll(Fonogramas, valueFono)

  } catch (error) {
    try {
      await page.waitForSelector(".alert.alert-warning.msg-warning", {visible:true})
      await ProcessoController.updateStatusFonogramas(processo_id, "Abrammus Atualizando")
    } catch (error) {
      console.log("Erro: Obras não encontradas")
    }
    console.log("Erro: Fonograma não encontrado: "+autor.nome)
  }

  for (const iterator of pseudonimosList) {
    console.log(`Pseudonimo Fonograma: ${iterator}`)
    await page.goto('https://portal.abramus.org.br/portal/v/principal.faces');
    
    await page.goto('https://portal.abramus.org.br/portal/v/naoIdentificado/identificarFonograma.faces');
    
    await page.click("#form\\:movieBtn1")
    await page.waitForSelector("#form\\:interprete", {visible: true})
    await page.type("#form\\:interprete", iterator)
    await page.click("#form\\:j_idt136")
  
    try {
      await page.waitForSelector("#form\\:j_idt151", {visible: true})
      await page.screenshot({path: `Busca-${iterator}.png`});
    
      let element = await page.$('#form\\:listasolr_data')
      let value = await page.evaluate(el => el.textContent, element)      
      parseAll(Fonogramas, value)
          
    } catch (error) {
      console.log("Erro: Fonograma não encontradas Pseudonimo: "+iterator)      
    }  
  }

  const filteredFonogramas = Fonogramas.reduce((acc, current) => {
    const x = acc.find(item => item.codEcad === current.codEcad && item.titulo === current.titulo && item.interprete === current.interprete && item.competencia === current.competencia
      && item.faixa === current.faixa && item.motivo === current.motivo && item.execucao === current.execucao && item.autores === current.autores);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);
  if (filteredObras.length>0){
    await ProcessoController.updateFonogramas(filteredFonogramas, processo_id)
  }
  console.log("DONE")
  await browser.close();
  return 0
}

async function mock(){ 
    const processo_id = "5fc8d9a389e34100177d7c05"
    const credito = {
        "nome": "Nívea Soares",
        "email":"pro5@lamusic.com.br",
        "cpf":"031.778.196-02",
        "telefone":"124124124125",
        "nome_artistico":"Nivea Soares",
        "associacao":"Abrammus",
        "redes_sociais":["rede1","rede2"],
        "lista_musicas":["link1","link2","link3"]
    }   
    await AbrammusPuppet( credito, processo_id)
    
    console.log("\n Done Mocking Puppet")
    console.log("+++++++++++++++++++++++++++++")
}
mock()
// module.exports = mock