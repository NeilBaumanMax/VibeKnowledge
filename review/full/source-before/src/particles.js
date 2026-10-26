// Stable sample identities. Camera/observation changes never delete failed cases.
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,t)=>{let u=clamp((t-a)/(b-a));return u*u*(3-2*u)};
const mix=(a,b,u)=>a+(b-a)*u;
function seeded(n){const x=Math.sin(n*127.1+311.7)*43758.5453123;return x-Math.floor(x)}
const dots=Array.from({length:1200},(_,i)=>{
 const gold=i<12,k=i-12,layer=i%3;
 return {id:i,gold,z:layer,x:gold?1125+(i%3)*145:310+(k%34)*42+(layer-1)*6,y:gold?460+Math.floor(i/3)*39:685+Math.floor(k/34)*18+(layer-1)*7};
});
const dotCanvas=document.getElementById('universe'),ctx=dotCanvas.getContext('2d');
function line(x,y,x2,y2,c,w=1){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke()}
function ring(x,y,r,a,c='#e8c985'){ctx.save();ctx.globalAlpha*=a;ctx.strokeStyle=c;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();ctx.restore()}
function sampleMark(x,y,success,r,alpha=1){ctx.save();ctx.translate(x,y);ctx.globalAlpha*=alpha;ctx.strokeStyle=success?'#e8c985':'#8794a6';ctx.fillStyle=success?'#e8c985':'#8794a6';ctx.lineWidth=1.3;
 ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.globalAlpha*=.16;ctx.fill();ctx.globalAlpha/=.16;ctx.stroke();
 ctx.beginPath();if(success){ctx.moveTo(-r*.48,0);ctx.lineTo(-r*.12,r*.35);ctx.lineTo(r*.50,-r*.34)}else{ctx.moveTo(-r*.32,-r*.32);ctx.lineTo(r*.32,r*.32);ctx.moveTo(r*.32,-r*.32);ctx.lineTo(-r*.32,r*.32)}ctx.stroke();ctx.restore();}
function cameraAt(t){let z=1+.38*smooth(.35,1.6,t)-.38*smooth(2,3.2,t)+1.1*smooth(3.9,4.8,t)-1.25*smooth(7,9.2,t);return {z,y:smooth(16.95,17.5,t)*120*(1-smooth(18.9,19.5,t))};}
// Persistent identities travel through a coherent current; no per-frame randomness.
function worldSample(p,t){
 const id=p.id, phase=seeded(id+73)*Math.PI*2;
 const u=p.gold?(id+.5)/12:seeded(id+11),v=seeded(id+27);
 const depth=.55+seeded(id+91)*.8;
 const x=90+1740*u+Math.sin(t*.64+v*5)*65*depth;
 const y=695+v*225+Math.sin(u*8-t*.92)*20*depth+Math.sin(t*.43+phase)*8;
 if(!p.gold)return {x,y,depth};
 // The selected cases are drawn out of the population toward public attention.
 const select=smooth(.05+(id%3)*.08,1.55+(id%3)*.08,t);
 const gx=p.x+Math.sin(t*.9+phase)*19,gy=p.y+Math.cos(t*.78+phase)*11;
 return {x:mix(x,gx,select),y:mix(y,gy,select),depth:1};
}
function samplePose(p,t){
 const c=cameraAt(t),q=worldSample(p,t),reveal=smooth(17,17.32,t)*(1-smooth(17.32,18.55,t));
 const depth=q.depth;
 return {x:1320+(q.x-1320)*c.z+(q.x-1100)*reveal*.015,
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
function windowPose(t){const c=cameraAt(t);let box={x:1320+(1055-1320)*c.z,y:500+(406-500)*c.z+c.y,w:475*c.z,h:233*c.z};
 const reveal=smooth(17,17.5,t);for(const [k,v] of Object.entries({x:120,y:490,w:1740,h:530}))box[k]=mix(box[k],v,reveal);
 const aircraft=smooth(18.95,19.8,t);for(const [k,v] of Object.entries({x:1080,y:330,w:680,h:550}))box[k]=mix(box[k],v,aircraft);
 return box;
}
function observationWindow(t,alpha){const b=windowPose(t);ctx.save();ctx.globalAlpha*=alpha;ctx.strokeStyle='#e8c985';ctx.lineWidth=1.8;ctx.strokeRect(b.x,b.y,b.w,b.h);
 // Four lens corners communicate an observation boundary, not a physical barrier.
 for(const [x,y,sx,sy] of [[b.x,b.y,1,1],[b.x+b.w,b.y,-1,1],[b.x,b.y+b.h,1,-1],[b.x+b.w,b.y+b.h,-1,-1]]){line(x,y,x+sx*25,y,'#e8c985',3);line(x,y,x,y+sy*25,'#e8c985',3)}ctx.restore();}
function routeCurve(x0,y0,x1,y1,color,alpha){ctx.save();ctx.globalAlpha*=alpha;ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x0,y0);ctx.bezierCurveTo(x0+240,y0,x1-280,y1,x1,y1);ctx.stroke();ctx.restore()}
function drawParticles(t){
 ctx.clearRect(0,0,1920,1080);ctx.fillStyle='#07090e';ctx.fillRect(0,0,1920,1080);
 const hush=1-.98*smooth(16.2,16.75,t)*(1-smooth(17,17.12,t));
 const bg=ctx.createRadialGradient(1300,490,50,1000,540,1100);bg.addColorStop(0,'#192431');bg.addColorStop(.6,'#0c131e');bg.addColorStop(1,'#06090e');ctx.globalAlpha=hush;ctx.fillStyle=bg;ctx.fillRect(0,0,1920,1080);
 // A broad population current occupies the lower depth field, leaving the type clear.
 if(t>=19.15){ctx.save();ctx.globalAlpha=.10*hush;for(let i=-6;i<=6;i++)line(960+i*80,400,960+i*330,1080,'#7e8c9e',.7);for(let i=0;i<9;i++){let y=420+i*i*9;line(80,y,1840,y,'#7e8c9e',.7)}ctx.restore();}
 const sampleAlpha=(1-smooth(19,19.9,t))*hush;
 ctx.save();ctx.globalAlpha=sampleAlpha;
 // Far cases are painted first; nearer layers have larger cores and stronger motion.
 for(const p of dots){const a=p.gold?.98:(.25+seeded(p.id+91)*.39);drawFlowSample(p,Math.min(t,18.9),a);}
 ctx.restore();
 if(t>=27.4){ctx.save();ctx.globalAlpha=.56*smooth(27.4,28.35,t);
  for(const p of dots){const k=p.id-12;const q={x:p.gold?1270+(p.id%3)*85:180+(k%66)*11.7,y:p.gold?813+Math.floor(p.id/3)*22:840+Math.floor(k/66)*5.8,r:p.gold?6:1.25};sampleMark(q.x,q.y,p.gold,q.r,p.gold?.95:.42+(p.z*.1));}ctx.restore();}
 observationWindow(t,hush*(t<19.5?.7:1));
 drawSampleMeanings(t,hush);
 if(t>=19.15)drawAircraftExperiment(t);
 ctx.globalAlpha=1;
}
