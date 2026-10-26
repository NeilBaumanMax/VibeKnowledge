from pathlib import Path
p=Path('film/src/particles.js'); s=p.read_text()
s=s.replace('Array.from({length:420}', 'Array.from({length:1200}')
a=s.index('function samplePose(');b=s.index('function windowPose(',a)
s=s[:a]+'''// Persistent identities travel through a coherent current; no per-frame randomness.
function worldSample(p,t){
 const id=p.id, phase=seeded(id+73)*Math.PI*2;
 const u=p.gold?(id+.5)/12:seeded(id+11),v=seeded(id+27);
 const depth=.55+seeded(id+91)*.8;
 const x=90+1740*u+Math.sin(t*.64+v*5)*65*depth;
 const y=640+v*325+Math.sin(u*8-t*.92)*33*depth+Math.sin(t*.43+phase)*16;
 if(!p.gold)return {x,y,depth};
 // The selected cases are drawn out of the population toward public attention.
 const select=smooth(.05+(id%3)*.08,1.55+(id%3)*.08,t);
 const gx=p.x+Math.sin(t*.9+phase)*19,gy=p.y+Math.cos(t*.78+phase)*11;
 return {x:mix(x,gx,select),y:mix(y,gy,select),depth:1};
}
function samplePose(p,t){
 const c=cameraAt(t),q=worldSample(p,t),reveal=smooth(17,17.32,t)*(1-smooth(17.32,18.55,t));
 const depth=q.depth;
 return {x:1320+(q.x-1320)*c.z+(q.x-1100)*reveal*.045,
 y:500+(q.y-500)*c.z+c.y+Math.sin(q.x*.006-t*2)*reveal*18,
 r:(p.gold?5.4:1.6+depth*.9)*c.z,depth};
}
function drawFlowSample(p,t,alpha){
 const q=samplePose(p,t),prev=samplePose(p,Math.max(0,t-.18));
 ctx.save();ctx.globalAlpha*=alpha;
 const color=p.gold?'#ebcb83':'#8d9eaf';
 const speed=Math.hypot(q.x-prev.x,q.y-prev.y);
 // Short trails reveal actual sample trajectories; they do not create new samples.
 if(speed>1.4){ctx.strokeStyle=color;ctx.lineWidth=Math.max(.65,q.r*.38);ctx.globalAlpha*=p.gold?.40:.25;
 ctx.beginPath();ctx.moveTo(prev.x,prev.y);ctx.lineTo(q.x,q.y);ctx.stroke();ctx.globalAlpha/=(p.gold?.40:.25);}
 if(p.gold){const glow=ctx.createRadialGradient(q.x,q.y,0,q.x,q.y,q.r*6);glow.addColorStop(0,'rgba(232,201,133,.40)');glow.addColorStop(.3,'rgba(232,201,133,.12)');glow.addColorStop(1,'rgba(232,201,133,0)');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(q.x,q.y,q.r*6,0,Math.PI*2);ctx.fill();}
 ctx.fillStyle=color;ctx.beginPath();ctx.arc(q.x,q.y,q.r,0,Math.PI*2);ctx.fill();
 // Result symbols only become visible in a close view; the distant population remains a light field.
 if(p.gold&&t>1.65&&q.r>7){ctx.strokeStyle='#fff1cd';ctx.lineWidth=1.15;ctx.beginPath();ctx.moveTo(q.x-3,q.y);ctx.lineTo(q.x-1,q.y+2);ctx.lineTo(q.x+3,q.y-2);ctx.stroke();}
 ctx.restore();
}
''' +s[b:]
a=s.index(' // Perspective planes');b=s.index(' // A single common',a)
s=s[:a]+''' // A broad population current occupies the lower depth field, leaving the type clear.
 if(t>=19.15){ctx.save();ctx.globalAlpha=.10*hush;for(let i=-6;i<=6;i++)line(960+i*80,400,960+i*330,1080,'#7e8c9e',.7);for(let i=0;i<9;i++){let y=420+i*i*9;line(80,y,1840,y,'#7e8c9e',.7)}ctx.restore();}
 const sampleAlpha=(1-smooth(19,19.9,t))*hush;
 ctx.save();ctx.globalAlpha=sampleAlpha;
 // Far cases are painted first; nearer layers have larger cores and stronger motion.
 for(const p of dots){const a=p.gold?.98:(.25+seeded(p.id+91)*.39);drawFlowSample(p,Math.min(t,18.9),a);}
 ctx.restore();
 if(t>=27.4){ctx.save();ctx.globalAlpha=.56*smooth(27.4,28.35,t);
  for(const p of dots){const k=p.id-12;const q={x:p.gold?1270+(p.id%3)*85:180+(k%66)*11.7,y:p.gold?813+Math.floor(p.id/3)*22:840+Math.floor(k/66)*5.8,r:p.gold?6:1.25};sampleMark(q.x,q.y,p.gold,q.r,p.gold?.95:.42+(p.z*.1));}ctx.restore();}
''' +s[b:]
p.write_text(s)
p=Path('tools/build.mjs');s=p.read_text();a=s.index('const marked=');b=s.index('const captionsHTML=',a)
s=s[:a]+'''const marked=s=>Array.from(s).map((ch,i)=>{
 const success=s.indexOf('成功'),failure=s.indexOf('无数失败');
 const color=success>=0&&i>=success&&i<success+2?' gold':failure>=0&&i>=failure&&i<failure+4?' muted':'';
 return `<span class="char-mask${color}"><span class="glyph" data-layout-allow-overflow="true">${esc(ch)}</span></span>`;
}).join('');
'''+s[b:];p.write_text(s)
p=Path('film/src/styles.css');s=p.read_text().replace('.caption p{white-space:nowrap;opacity:0}', '.caption p{white-space:nowrap;opacity:1}')
s+='''\n/* Every character rises behind its own baseline mask. */
.char-mask{display:inline-block;overflow:hidden;vertical-align:bottom;height:1.4em;line-height:1.4em}
.glyph{display:inline-block;will-change:transform}
''';p.write_text(s)
p=Path('film/src/timeline.js');s=p.read_text();a=s.index('  if(cap.id');b=s.index('\n });',a)
s=s[:a]+'''  const glyphs=el+' .glyph';
  const count=Array.from(cap.lines[i]).length;
  const step=Math.min(.045,.30/Math.max(1,count-1));
  const duration=cap.id==='reveal'?.25:.36;
  // A rapid cascade on the hit; a readable, softer wave elsewhere.
  // Opening starts partway through its first glyph so the first frame is not empty.
  tl.fromTo(glyphs,{yPercent:110},{yPercent:0,duration,ease:'power3.out',stagger:cap.id==='reveal'?.025:step,immediateRender:false},at-(cap.id==='hook'?.12:0));
''' +s[b:];p.write_text(s)
print('Particle flow and character masks implemented; aircraft source untouched.')
