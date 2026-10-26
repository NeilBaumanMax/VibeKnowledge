// Stable sample identities. Camera/observation changes never delete failed cases.
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,t)=>{let u=clamp((t-a)/(b-a));return u*u*(3-2*u)};
const mix=(a,b,u)=>a+(b-a)*u;
function seeded(n){const x=Math.sin(n*127.1+311.7)*43758.5453123;return x-Math.floor(x)}
const dots=Array.from({length:420},(_,i)=>{
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
function samplePose(p,t){const c=cameraAt(t),depth=1+(p.z-1)*.09;return {x:1320+(p.x-1320)*c.z*depth,y:500+(p.y-500)*c.z*depth+c.y,r:(p.gold?10:4.6)*c.z*depth};}
function windowPose(t){const c=cameraAt(t);let box={x:1320+(1055-1320)*c.z,y:500+(406-500)*c.z+c.y,w:475*c.z,h:233*c.z};
 const reveal=smooth(17,17.5,t);for(const [k,v] of Object.entries({x:200,y:490,w:1520,h:530}))box[k]=mix(box[k],v,reveal);
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
 // Perspective planes describe sample space. No decorative random stars.
 ctx.save();ctx.globalAlpha=.10*hush;for(let i=-6;i<=6;i++)line(960+i*80,400,960+i*330,1080,'#7e8c9e',.7);for(let i=0;i<9;i++){let y=420+i*i*9;line(80,y,1840,y,'#7e8c9e',.7)}ctx.restore();
 let sampleAlpha=(1-smooth(19,19.9,t))*hush;
 if(t>=27.4)sampleAlpha=.56*smooth(27.4,28.35,t);
 ctx.save();ctx.globalAlpha=sampleAlpha;
 for(const p of dots){let q=samplePose(p,Math.min(t,18.9));
  if(t>=27.4){q={x:p.gold?1270+(p.id%3)*85:180+((p.id-12)%34)*23,y:p.gold?813+Math.floor(p.id/3)*22:840+Math.floor((p.id-12)/34)*9,r:p.gold?6:2.4};}
  const completed=smooth(.15,.65,t);const a=p.gold?.95:.42+(p.z*.1);
  if(p.gold&&t<.65){ring(q.x,q.y,q.r,1,'#a6b0be');ring(q.x,q.y,q.r+6,completed*.3);}
  sampleMark(q.x,q.y,p.gold&&completed>.6,q.r,a);
 }
 ctx.restore();
 // A single common starting node feeds both outcome groups; observation retains one.
 if(t>=10.8&&t<16.8){let a=smooth(10.8,11.5,t)*hush;let g=samplePose(dots[0],t),f=samplePose(dots[250],t);routeCurve(250,500,g.x,g.y,'#e8c985',a*.7);routeCurve(250,500,f.x,f.y,'#a6b0be',a*.7);ring(250,500,14,a,'#e4e7e9');
  const flow=smooth(11.2,12.9,t);for(const end of [g,f]){let x=mix(250,end.x,flow),y=mix(500,end.y,smooth(0,1,flow));ring(x,y,5,a,'#eee9df');}
  if(t>13.3){const b=windowPose(t);routeCurve(b.x+b.w,b.y+b.h*.3,1770,350,'#e8c985',smooth(13.3,14,t)*.7);for(let k=0;k<3;k++){const s=smooth(13.5+k*.65,14.25+k*.65,t);if(s>0&&s<1)ring(mix(b.x+b.w,1770,s),mix(b.y+b.h*.3,350,s),5,.8,'#e8c985');}}
 }
 observationWindow(t,hush*(t<19.5?.7:1));
 if(t>=4&&t<7.1){const a=smooth(4,4.5,t)*(1-smooth(6.8,7.1,t));ctx.save();ctx.globalAlpha=a*.7;for(let i=0;i<3;i++){const p=samplePose(dots[i],t);line(p.x,p.y-14,p.x,380,'#e8c985',1)}ctx.restore();}
 if(t>=19.15)drawAircraftExperiment(t);
 ctx.globalAlpha=1;
}
