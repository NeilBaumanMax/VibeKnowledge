import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');const film=path.join(root,'film');
const captions=JSON.parse(fs.readFileSync(path.join(film,'src/captions.json'),'utf8'));
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const marked=s=>esc(s).replaceAll('成功','<span class="gold">成功</span>').replaceAll('无数失败','<span class="muted">无数失败</span>');
const captionsHTML=captions.map(c=>`<section class="clip ${c.kind}" id="${c.id}" data-start="${c.start}" data-duration="${(c.end-c.start).toFixed(6)}" data-track-index="2"><div class="caption">${c.lines.map(l=>`<p>${marked(l)}</p>`).join('')}${c.english?`<div class="english">${esc(c.english)}</div>`:''}</div></section>`).join('\n');
const cues=JSON.parse(fs.readFileSync(path.join(film,'assets/audio/music-cues.json'),'utf8'));const onsets=cues.source_onsets.map(t=>t-cues.excerpt_start).filter(t=>t>=0&&t<=30);
const css=fs.readFileSync(path.join(film,'src/styles.css'),'utf8');const js=['aircraft','particles','timeline'].map(n=>fs.readFileSync(path.join(film,'src/'+n+'.js'),'utf8')).join('\n');
const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=1920,height=1080"><title>幸存者偏差 · Vibe 知识大赏</title><script src="assets/vendor/gsap.min.js"></script><style>${css}</style></head><body><div id="root" data-composition-id="main" data-start="0" data-duration="30" data-width="1920" data-height="1080" data-fps="30">
<canvas id="universe" width="1920" height="1080" data-layout-ignore="true"></canvas>
<div id="tag1" class="tag">考研上岸</div><div id="tag2" class="tag">创业成功</div><div id="tag3" class="tag">年入百万</div>
<div id="returnedLabel" class="scene-note">返航样本</div><div id="missingLabel" class="scene-note">未进入统计</div><div id="illustrationNote" class="scene-note">二战飞机 · 原理示意</div>
${captionsHTML}
<div id="flash" data-layout-ignore="true"></div>
<audio id="score" src="assets/audio/score.wav" data-start="0" data-duration="30" data-track-index="0" data-volume="1"></audio>
</div><script>const AUDIO_ONSETS=${JSON.stringify(onsets)};const CAPTIONS=${JSON.stringify(captions)};${js}</script></body></html>`;
fs.writeFileSync(path.join(film,'index.html'),html);
function stamp(t){let ms=Math.round(t*1000);return [Math.floor(ms/3600000),Math.floor(ms/60000)%60,Math.floor(ms/1000)%60].map(x=>String(x).padStart(2,'0')).join(':')+','+String(ms%1000).padStart(3,'0')}
fs.writeFileSync(path.join(root,'output/幸存者偏差_字幕.srt'),captions.map((c,i)=>`${i+1}\n${stamp(c.start)} --> ${stamp(c.end)}\n${c.lines.join('\n')}\n`).join('\n'));
fs.writeFileSync(path.join(root,'docs/02_实际字幕时间轴.csv'),'id,start_seconds,end_seconds,start_frame,end_frame,text\n'+captions.map(c=>`${c.id},${c.start},${c.end},${Math.round(c.start*30)},${Math.round(c.end*30)},"${c.lines.join(' / ')}"`).join('\n'));
console.log('Built film/index.html, SRT, timed captions CSV');
await import('./complete_captions.mjs');
