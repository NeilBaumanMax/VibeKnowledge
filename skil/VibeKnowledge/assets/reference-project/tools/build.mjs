import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');const film=path.join(root,'film');
const config=JSON.parse(fs.readFileSync(path.join(film,'src/config.json'),'utf8'));
fs.mkdirSync(path.join(root,config.outputDir),{recursive:true});
const captions=JSON.parse(fs.readFileSync(path.join(film,'src/captions.json'),'utf8'));
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const marked=s=>Array.from(s).map((ch,i)=>{
 const success=s.indexOf('成功'),failure=s.indexOf('无数失败');
 const color=success>=0&&i>=success&&i<success+2?' gold':failure>=0&&i>=failure&&i<failure+4?' muted':'';
 return `<span class="char-mask${color}"><span class="glyph" data-layout-allow-overflow="true">${esc(ch)}</span></span>`;
}).join('');
const captionsHTML=captions.map(c=>`<section class="clip ${c.kind}" id="${c.id}" data-start="${c.start}" data-duration="${(c.end-c.start).toFixed(6)}" data-track-index="2"><div class="caption"${["wald","ending"].includes(c.id)?" data-hold":""}>${c.lines.map(l=>`<p>${marked(l)}</p>`).join('')}${c.english?`<div class="english">${esc(c.english)}</div>`:''}</div></section>`).join('\n');
const cues=JSON.parse(fs.readFileSync(path.join(film,'assets/audio/music-cues.json'),'utf8'));const onsets=cues.source_onsets.map(t=>t-cues.excerpt_start).filter(t=>t>=0&&t<=config.duration);
const css=fs.readFileSync(path.join(film,'src/styles.css'),'utf8');const js=['aircraft','particles','semantics','continuation','reality','timeline'].map(n=>fs.readFileSync(path.join(film,'src/'+n+'.js'),'utf8')).join('\n');
const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=1920,height=1080"><title>幸存者偏差 · Vibe 知识大赏</title><script src="assets/vendor/gsap.min.js"></script><style>${css}</style></head><body><div id="root" data-composition-id="main" data-start="0" data-duration="${config.duration}" data-width="1920" data-height="1080" data-fps="30">
<canvas id="universe" width="1920" height="1080" data-layout-ignore="true"></canvas>
<div id="tag1" class="tag">考研上岸</div><div id="tag2" class="tag">创业成功</div><div id="tag3" class="tag">年入百万</div>
<div id="returnedLabel" class="scene-note">返航样本</div><div id="missingLabel" class="scene-note">未进入统计</div><div id="illustrationNote" class="scene-note">二战飞机 · 原理示意</div>
${captionsHTML}
<div id="flash" data-layout-ignore="true"></div>
<audio id="score" src="${config.audioFile}" data-start="0" data-duration="${config.duration}" data-track-index="0" data-volume="1"></audio>
</div><script>const CONFIG=${JSON.stringify(config)};const AUDIO_ONSETS=${JSON.stringify(onsets)};const CAPTIONS=${JSON.stringify(captions)};${js}</script></body></html>`;
fs.writeFileSync(path.join(film,'index.html'),html);
function stamp(t){let ms=Math.round(t*1000);return [Math.floor(ms/3600000),Math.floor(ms/60000)%60,Math.floor(ms/1000)%60].map(x=>String(x).padStart(2,'0')).join(':')+','+String(ms%1000).padStart(3,'0')}
fs.writeFileSync(path.join(root,config.outputDir,config.subtitleFile),captions.map((c,i)=>`${i+1}\n${stamp(c.start)} --> ${stamp(c.end)}\n${c.lines.join('\n')}\n`).join('\n'));
fs.writeFileSync(path.join(root,config.csvFile),'id,start_seconds,end_seconds,start_frame,end_frame,text\n'+captions.map(c=>`${c.id},${c.start},${c.end},${Math.round(c.start*30)},${Math.round(c.end*30)},"${c.lines.join(' / ')}"`).join('\n'));
console.log('Built film/index.html, SRT, timed captions CSV');
await import('./complete_captions.mjs');
