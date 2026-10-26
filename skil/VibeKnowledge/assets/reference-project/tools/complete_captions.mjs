import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');const cap=JSON.parse(fs.readFileSync(path.join(root,'film/src/captions.json'),'utf8'));
const config=JSON.parse(fs.readFileSync(path.join(root,'film/src/config.json'),'utf8'));
const rows=cap.flatMap(c=>c.lines.map((line,i)=>({...c,id:c.id+'-'+i,start:c.start+(c.lineDelays?.[i]||0),lines:[line]})));
const points=[...new Set(rows.flatMap(c=>[c.start,c.end]))].sort((a,b)=>a-b);
const cue=[];for(let i=0;i<points.length-1;i++){let start=points[i],end=points[i+1];let active=rows.filter(c=>c.start<=start+.00001&&c.end>start+.00001);if(active.length)cue.push({start,end,lines:active.flatMap(c=>c.lines)})}
const stamp=t=>{let ms=Math.round(t*1000);return [Math.floor(ms/3600000),Math.floor(ms/60000)%60,Math.floor(ms/1000)%60].map(x=>String(x).padStart(2,'0')).join(':')+','+String(ms%1000).padStart(3,'0')};
fs.writeFileSync(path.join(root,config.outputDir,config.subtitleFile),cue.map((c,i)=>`${i+1}\n${stamp(c.start)} --> ${stamp(c.end)}\n${c.lines.join('\n')}\n`).join('\n'));
fs.writeFileSync(path.join(root,config.csvFile),'id,start_seconds,end_seconds,start_frame,end_frame,text\n'+rows.map(c=>`${c.id},${c.start.toFixed(3)},${c.end.toFixed(3)},${Math.round(c.start*30)},${Math.round(c.end*30)},"${c.lines.join(' / ')}"`).join('\n'));
const file=path.join(root,config.planFile);let doc=fs.readFileSync(file,'utf8');let a=doc.indexOf('## 4. 字幕时间轴'),b=doc.indexOf('## 5. 视觉风格说明');doc=doc.slice(0,a)+'## 4. 字幕时间轴\n\n以下是与实际配乐同步后的渲染时间（秒）；字幕逐字从下方遮罩上滑，单字0.36秒、错峰总长不超过0.30秒；概念标题单字0.25秒、错峰0.025秒，片段含入场及退场时间。\n\n| 起点 | 终点 | 文字 |\n|---:|---:|---|\n'+rows.map(c=>`|${c.start.toFixed(3)}|${c.end.toFixed(3)}|${c.lines.join('／')}|`).join('\n')+'\n\n'+doc.slice(b);doc=doc.replaceAll('120 BPM','约104 BPM');fs.writeFileSync(file,doc);
