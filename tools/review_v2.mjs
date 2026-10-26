import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';
const root=path.resolve(import.meta.dirname,'..');
// Inspect the exact pure geometry functions used by the renderer; no replacement animation.
const sandbox={document:{getElementById:()=>({getContext:()=>({})})},Math,AUDIO_ONSETS:[]};vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'film/src/particles.js'),'utf8'),sandbox);
const geometry=vm.runInContext(`(()=>{
 const result={total:dots.length,success:dots.filter(d=>d.gold).length,failure:dots.filter(d=>!d.gold).length,stages:[]};
 for(const t of [0,1.6,3.2,5.5,7.3,9.5,12.5,14.8,17.5]){
  const box=windowPose(t);let visibleFailures=0,selectedSuccesses=0,selectedFailures=0;
  for(const p of dots){const q=samplePose(p,t);if(!p.gold&&q.x>=0&&q.x<=1920&&q.y>=0&&q.y<=1080)visibleFailures++;
  if(q.x>=box.x&&q.x<=box.x+box.w&&q.y>=box.y&&q.y<=box.y+box.h){if(p.gold)selectedSuccesses++;else selectedFailures++;}}
  result.stages.push({time:t,visibleFailures,selectedSuccesses,selectedFailures,box});
 }return result;
})()`,sandbox);
const caps=JSON.parse(fs.readFileSync(path.join(root,'film/src/captions.json'),'utf8'));
const reading=caps.flatMap(c=>c.lines.map((s,i)=>({id:c.id,line:s,start:c.start+(c.lineDelays?.[i]||0),end:c.end,readableSeconds:Math.round((c.end-c.start-(c.lineDelays?.[i]||0)-.36)*1000)/1000,characters:s.replace(/[，？：……]/g,'').length})));
const html=fs.readFileSync(path.join(root,'film/index.html'),'utf8');
const report={geometry,reading,cornerElementsRemoved:['brand','series','footer','progress','progressInner'].every(id=>!html.includes(`id="${id}"`)),revealAt17:caps.find(x=>x.id==='reveal').start===17,stagedConfirmation:caps.find(x=>x.id==='incomplete').lineDelays[1]===1.7,captionCount:caps.length};
fs.writeFileSync(path.join(root,'review/v2/semantic-measurements.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
