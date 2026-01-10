const fs = require('fs');
const path = require('path');

const readmePath = path.join(__dirname,'..','README.md');
const outPath = path.join(__dirname,'..','docs','data.json');

const text = fs.readFileSync(readmePath,'utf8');
const lines = text.split(/\r?\n/);

const sections = [];
let cur = null;
for(const line of lines){
  const h = line.match(/^##\s+(.*)$/);
  if(h){
    if(cur) sections.push(cur);
    cur = {section: h[1].trim(), items:[]};
    continue;
  }
  const li = line.match(/^-\s+\[(.+?)\]\((https?:\/\/[^)]+)\)/);
  if(li && cur){
    const title = li[1].trim();
    const url = li[2].trim();
    // create a short slug from the last non-empty path segment of the URL (fallback to hostname)
    let slug;
    try{
      const u = new URL(url);
      const parts = u.pathname.replace(/\/$/,'').split('/').filter(Boolean);
      slug = parts.length ? parts[parts.length-1] : u.hostname.replace(/\./g,'-');
    }catch(e){
      slug = url.replace(/https?:\/\//,'').replace(/\/$/,'').replace(/[:\/\?=&#]/g,'-').replace(/[^a-zA-Z0-9-_\.]/g,'').split('/').join('-');
    }
    slug = slug.replace(/[^a-zA-Z0-9-_\.]/g,'-');
    const img = `screenshots/${slug}.png`;
    cur.items.push({title, url, img});
  }
}
if(cur) sections.push(cur);
fs.mkdirSync(path.dirname(outPath),{recursive:true});
fs.writeFileSync(outPath, JSON.stringify(sections,null,2), 'utf8');
console.log('Wrote', outPath);
