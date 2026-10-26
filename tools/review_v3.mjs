import fs from 'node:fs';import vm from 'node:vm';import crypto from 'node:crypto';
const source=fs.readFileSync('film/src/particles.js','utf8');
const box={document:{getElementById:()=>({getContext:()=>({})})},Math};vm.createContext(box);vm.runInContext(source,box);
const motion=vm.runInContext(`(()=>{
 const stages=[3.3,5.4,9.6,12.1,14.6].map(t=>{
 let total=0,maximum=0,moving=0;for(const p of dots){const a=samplePose(p,t),b=samplePose(p,t+.5),d=Math.hypot(a.x-b.x,a.y-b.y);total+=d;maximum=Math.max(maximum,d);if(d>.5)moving++;}
 return {time:t,interval:.5,moving,total:dots.length,meanDistancePx:total/dots.length,maxDistancePx:maximum};
 });
 const selection=[3.3,5.5,9.5,12.5,14.8,17.5].map(t=>{const b=windowPose(t);let gold=0,gray=0;for(const p of dots){let q=samplePose(p,t);if(q.x>b.x&&q.x<b.x+b.w&&q.y>b.y&&q.y<b.y+b.h){if(p.gold)gold++;else gray++;}}return {time:t,gold,gray};});
 const continuity=[];for(const t of [1.5,3.2,5.5,7.3,9.5,14,17.5]){let m=0;for(const p of dots){const a=samplePose(p,t),b=samplePose(p,t+1/30);m=Math.max(m,Math.hypot(a.x-b.x,a.y-b.y));}continuity.push({time:t,maxPerFramePx:m});}
 return {samples:dots.length,successes:dots.filter(p=>p.gold).length,stages,selection,continuity};
})()`,box);
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const captions=JSON.parse(fs.readFileSync('film/src/captions.json','utf8'));
const reading=captions.flatMap(c=>c.lines.map((line,i)=>{const n=Array.from(line).length,step=c.id==='reveal'?.025:Math.min(.045,.30/Math.max(1,n-1)),duration=c.id==='reveal'?.25:.36;const at=c.start+(c.lineDelays?.[i]||0);return {id:c.id,line,start:at,lastGlyphSettled:at+duration+step*(n-1),wholeLineHold:c.end-.16-at-duration-step*(n-1)};}));
const report={motion,aircraftSourceUnchanged:hash('film/src/aircraft.js')===hash('review/v3/source-before/aircraft.js'),aircraftHash:hash('film/src/aircraft.js'),reading};
fs.writeFileSync('review/v3/motion-review.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
