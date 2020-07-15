const puppeteer = require('puppeteer');
const ProcessoController = require('../controllers/ProcessosController')

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

async function FonogramaPuppet(autor, processo_id) {
  const Fonogramas = []
  console.log("Scraping Fonogramas... Autor: "+autor)
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

  await page.type("#username", 'luiz@lamusic.com.br')
  await page.type("#password", 'VanGogh7671')
  
  await Promise.all([
    page.waitForNavigation(),
    page.click("#kc-login")
  ])

  await page.goto('https://portal.abramus.org.br/portal/v/naoIdentificado/identificarFonograma.faces');
  await page.click("#form\\:movieBtn1")
  await page.waitForSelector("#form\\:interprete", {visible: true})
  await page.type("#form\\:interprete", autor)
  await page.click("#form\\:j_idt136")
  
  try {
    await page.waitForSelector("#form\\:j_idt151", {visible: true})
  } catch (error) {
    await ProcessoController.updateStatusFonogramas(processo_id, "Fonograma não Encontrado")
    console.log("Erro: Fonogramas não encontrados")
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
    Fonogramas.push({codEcad:codEcad[index], titulo:titulo[index],interprete: interprete[index], 
      competencia: competencia[index],faixa: faixa[index], motivo: motivo[index], 
      execucao: execucao[index], autores: autores[index]})
  }

  console.log("Scraped Fonogramas... "+JSON.stringify(Fonogramas))
  await ProcessoController.updateFonogramas(Fonogramas, processo_id)
  
  console.log("Salvo")
  await browser.close();
}

module.exports = FonogramaPuppet