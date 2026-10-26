import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),film=path.join(root,'film');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const config=JSON.parse(read('film/src/config.json')),runtime=JSON.parse(read('runtime.json'));
if(!config.ready)throw new Error('Author this topic’s captions/scenes, then set config.ready=true.');
const duration=runtime.duration,all=JSON.parse(read('film/src/captions.json'));
if(!all.length||!config.scenes.length)throw new Error('Captions and knowledge scenes must not be empty.');
const ids=new Set();for(const cap of all){
 if(!/^[a-z][a-z0-9_-]*$/.test(cap.id)||ids.has(cap.id))throw new Error('Invalid/duplicate caption id');ids.add(cap.id);
 if(!Array.isArray(cap.lines)||!cap.lines.length||!cap.lines.every(x=>typeof x==='string'&&x.length)||!Number.isFinite(cap.start)||!Number.isFinite(cap.end)||cap.end<=cap.start||cap.start<0)throw new Error('Invalid caption');
}
for(const s of config.scenes)if(!Number.isFinite(s.start)||!Number.isFinite(s.end)||s.end<=s.start||!s.id)throw new Error('Invalid scene');
let covered=0;for(const scene of [...config.scenes].sort((a,b)=>a.start-b.start)){
 if(scene.start>covered+.001&&covered<duration)throw new Error('Knowledge scene gap at '+covered+'s');covered=Math.max(covered,scene.end);
}
if(covered<duration)throw new Error('Scenes end before the requested video duration');
const captions=all.filter(c=>c.start<duration).map(c=>({...c,end:Math.min(c.end,duration)}));
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const json=x=>JSON.stringify(x).replaceAll('<','\\u003c');
const chars=(text,cap)=>Array.from(text).map(ch=>`<span class="char-mask${(cap.emphasis??[]).some(w=>w.includes(ch))?' emphasis':''}"><span class="glyph" data-layout-allow-overflow="true">${esc(ch)}</span></span>`).join('');
const clips=captions.map(c=>`<section class="clip ${esc(c.kind??'top')}" id="${c.id}" data-start="${c.start}" data-duration="${c.end-c.start}" data-track-index="2"><div class="caption"${c.readingHold?' data-hold':''}>${c.lines.map(l=>'<p>'+chars(l,c)+'</p>').join('')}${c.english?'<div class="english">'+esc(c.english)+'</div>':''}</div></section>`).join('\n');
fs.mkdirSync(path.join(film,'assets/vendor'),{recursive:true});
fs.copyFileSync(path.join(root,'node_modules/gsap/dist/gsap.min.js'),path.join(film,'assets/vendor/gsap.min.js'));
const js=['motion','scenes','timeline'].map(n=>read('film/src/'+n+'.js')).join('\n');
const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>${esc(config.title)}</title><script src="assets/vendor/gsap.min.js"></script><style>${read('film/src/styles.css')}</style></head><body><div id="root" data-composition-id="main" data-start="0" data-duration="${duration}" data-width="1920" data-height="1080" data-fps="30"><canvas id="universe" width="1920" height="1080" data-layout-ignore="true"></canvas>${clips}<audio id="score" src="assets/audio/score-${runtime.stage}.wav" data-start="0" data-duration="${duration}" data-track-index="0" data-volume="1"></audio></div><script>const CONFIG=${json(config)},RUNTIME=${json(runtime)},CAPTIONS=${json(captions)};${js}</script></body></html>`;
fs.writeFileSync(path.join(film,'index.html'),html);
const out=path.join(root,'output',runtime.stage);fs.mkdirSync(out,{recursive:true});
const stamp=t=>{const m=Math.round(t*1000);return [Math.floor(m/3600000),Math.floor(m/60000)%60,Math.floor(m/1000)%60].map(x=>String(x).padStart(2,'0')).join(':')+','+String(m%1000).padStart(3,'0')};
const rows=captions.flatMap(c=>c.lines.map((text,i)=>({id:c.id+'-'+i,text,start:c.start+(c.lineDelays?.[i]??0),end:c.end}))).filter(r=>r.start<r.end);
const points=[...new Set(rows.flatMap(r=>[r.start,r.end]))].sort((a,b)=>a-b),cues=[];
for(let i=0;i<points.length-1;i++){const active=rows.filter(r=>r.start<=points[i]&&r.end>points[i]);if(active.length)cues.push({start:points[i],end:points[i+1],text:active.map(r=>r.text).join('\n')});}
fs.writeFileSync(path.join(out,'captions.srt'),cues.map((r,i)=>`${i+1}\n${stamp(r.start)} --> ${stamp(r.end)}\n${r.text}\n`).join('\n'));
fs.writeFileSync(path.join(root,'docs/captions-'+runtime.stage+'.csv'),'id,start,end,text\n'+rows.map(r=>`${r.id},${r.start},${r.end},"${r.text.replaceAll('"','""')}"`).join('\n'));
console.log('Built '+runtime.stage+' '+duration+'s with local fonts, vendor script, soundtrack and timed captions.');
