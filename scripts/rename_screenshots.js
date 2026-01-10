const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const dataPath = path.join(__dirname,'..','docs','data.json');
const screenshotsDir = path.join(__dirname,'..','docs','screenshots');

const data = JSON.parse(fs.readFileSync(dataPath,'utf8'));
const allFiles = fs.readdirSync(screenshotsDir);

const renamed = [];
for(const section of data){
  for(const item of section.items){
    const desiredRel = item.img; // e.g. screenshots/25-02-gummybears.png
    const desired = path.join(__dirname,'..','docs', desiredRel);
    if(fs.existsSync(desired)) continue;

    const desiredBase = path.basename(desired);
    // try to find any file that contains the slug as suffix or contains the slug
    const slug = desiredBase.replace(/\.[^/.]+$/,'');
    const matches = allFiles.filter(f => f.includes(slug));
    if(matches.length === 1){
      const from = path.join(screenshotsDir, matches[0]);
      const to = desired;
      try{
        cp.execSync(`git mv "${from}" "${to}"`);
        renamed.push({from: matches[0], to: path.basename(to)});
        console.log('Renamed', matches[0], '->', path.basename(to));
      }catch(e){
        console.error('git mv failed for', matches[0], e.message);
      }
    }else if(matches.length > 1){
      // try exact suffix match like 'richard4231.github.io-25-02-gummybears.png'
      const exact = matches.find(f => f.endsWith('-'+desiredBase));
      if(exact){
        const from = path.join(screenshotsDir, exact);
        const to = desired;
        try{
          cp.execSync(`git mv "${from}" "${to}"`);
          renamed.push({from: exact, to: path.basename(to)});
          console.log('Renamed', exact, '->', path.basename(to));
        }catch(e){
          console.error('git mv failed for', exact, e.message);
        }
      } else {
        console.warn('Multiple matches for', desiredBase, matches);
      }
    }else{
      // no matches: maybe a svg with same slug + different extension
      const svgCandidate = slug + '.svg';
      if(allFiles.includes(svgCandidate)){
        const from = path.join(screenshotsDir, svgCandidate);
        const to = desired;
        try{
          cp.execSync(`git mv "${from}" "${to}"`);
          renamed.push({from: svgCandidate, to: path.basename(to)});
          console.log('Renamed', svgCandidate, '->', path.basename(to));
        }catch(e){
          console.error('git mv failed for', svgCandidate, e.message);
        }
      } else {
        console.warn('No match found for', desiredBase);
      }
    }
  }
}

console.log('Done. Renamed', renamed.length, 'files.');
