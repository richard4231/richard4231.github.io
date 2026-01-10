const fs = require('fs');
const path = require('path');
const puppeteer = (() => {
  try { return require('puppeteer-core'); } catch (e) { return require('puppeteer'); }
})();

(async ()=>{
  const dataPath = path.join(__dirname,'..','docs','data.json');
  const outDir = path.join(__dirname,'..','docs','screenshots');
  if(!fs.existsSync(dataPath)) throw new Error('data.json not found. Run scripts/generate_data.js first');
  const data = JSON.parse(fs.readFileSync(dataPath,'utf8'));
  fs.mkdirSync(outDir,{recursive:true});

  const launchOptions = { headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] };
  if (process.env.CHROME_PATH) launchOptions.executablePath = process.env.CHROME_PATH;
  else launchOptions.executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const browser = await puppeteer.launch(launchOptions);
  for(const section of data){
    for(const item of section.items){
      try{
        const url = item.url;
        const slug = path.basename(item.img).replace(/\.[^/.]+$/,'');
        const filePath = path.join(outDir, `${slug}.png`);
        console.log('Capturing', url, '->', filePath);
        const page = await browser.newPage();
        await page.setViewport({width:1200,height:720});
        await page.goto(url, {waitUntil:'networkidle2', timeout:30000});
        // wait a bit for sketches to initialise
        await new Promise(res => setTimeout(res, 800));
        await page.screenshot({path:filePath, fullPage:false});
        await page.close();
      }catch(e){
        console.warn('Fehler bei', item.url, e.message);
      }
    }
  }
  await browser.close();
})();
