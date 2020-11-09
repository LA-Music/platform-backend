const puppeteer = require('puppeteer');
const ProcessoController = require('../controllers/ProcessosController')

async function wait(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
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
async function AbrammusPuppet(autor, processo_id) {
  const Obras = []
  console.log("Scraping Obras... Autor: "+autor)
  const browser = await puppeteer.launch({
    defaultViewport: null,
    args: ['--enable-features=NetworkService','--no-sandbox', '--disable-dev-shm-usage'],
    ignoreHTTPSErrors: true
  });
  
  const page = await browser.newPage();
  
  await page.setViewport({
    width: 1920,  
    height: 1080
})

  await page.goto('https://portal.abramus.org.br/portal');

  // await page.type("#username", 'luiz@lamusic.com.br')
  // await page.type("#password", 'VanGogh7671')
  await page.type("#username", process.env.ABRAMMUS_EMAIL)
  await page.type("#password", process.env.ABRAMMUS_SENHA)
  
  await Promise.all([
    page.waitForNavigation(),
    page.click("#kc-login")
  ])

  await page.goto('https://portal.abramus.org.br/portal/v/naoIdentificado/identificarObra.faces');
  
  await page.click("#form\\:movieBtn1")
  
  await page.waitForSelector("#form\\:autor", {visible: true})
  await page.type("#form\\:autor", autor)
  await page.click("#form\\:j_idt136")

  try {
    await page.waitForSelector("#form\\:j_idt151", {visible: true})
  } catch (error) {
    try {
      await page.waitForSelector(".alert.alert-warning.msg-warning", {visible:true})
      console.log("Abrammus Atualizando")
    } catch (error) {
      await page.screenshot({path: 'erro.png'});
      console.log("Erro: Obras não encontradas")
    }
    
    // await ProcessoController.updateStatus(processo_id)
    return 0; 
  }
  
  let element = await page.$('#form\\:listasolr_data')
  let value = await page.evaluate(el => el.textContent, element)
  const codEcad = parseCod(value)
  const titulo = parseTitulo(value)
  const interprete = parseInterprete(value)
  const competencia = parseCompetencia(value)
  const faixa = parseFaixa(value)
  const motivo = parseMotivo(value)
  const execucao = parseExecucao(value)
  const autores = parseAutores(value)
  for (let index = 0; index < codEcad.length; index++) {
    Obras.push({codEcad:codEcad[index], titulo:titulo[index],interprete: interprete[index], 
      competencia: competencia[index],faixa: faixa[index], motivo: motivo[index], 
      execucao: (execucao ? execucao[index] : parseExecucao1(value)[index]), autores: autores[index]})
  }

  // await ProcessoController.updateObras(Obras, processo_id)
  console.log("Salvo")
  await browser.close();
}

async function UpdatePuppet(allProcessos){
    await AbrammusPuppet(allProcessos.nome, allProcessos._id)
    // for(const processo of allProcessos) {
    //     await AbrammusPuppet(processo.nome, processo._id)
    // }
    console.log("\n Done Updating Obras")
    console.log("+++++++++++++++++++++++++++++")
}
module.exports = UpdatePuppet