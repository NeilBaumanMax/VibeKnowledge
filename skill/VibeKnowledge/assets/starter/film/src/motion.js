// Deterministic reusable primitives. Meaning is supplied by each episode's scenes.
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=(a,b,t)=>{const u=clamp((t-a)/(b-a));return u*u*(3-2*u)};
const mix=(a,b,u)=>a+(b-a)*u;
function seeded(id){const n=Math.sin(id*127.1+311.7)*43758.5453;return n-Math.floor(n)}
function background(ctx){const bg=ctx.createRadialGradient(1250,450,60,960,540,1150);bg.addColorStop(0,'#192431');bg.addColorStop(.6,'#0c131e');bg.addColorStop(1,'#06090e');ctx.fillStyle=bg;ctx.fillRect(0,0,1920,1080)}
function glowDot(ctx,x,y,r,color,alpha=1){ctx.save();ctx.globalAlpha*=alpha;const g=ctx.createRadialGradient(x,y,0,x,y,r*5);g.addColorStop(0,color+'60');g.addColorStop(1,color+'00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r*5,0,Math.PI*2);ctx.fill();ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.restore()}
function riseLabel(ctx,text,x,y,time,start,{size=38,color='#f3eee4',alpha=1}={}){ctx.save();ctx.font=`600 ${size}px VibeSans`;ctx.textBaseline='top';ctx.globalAlpha*=alpha;let xx=x;Array.from(text).forEach((char,i)=>{const width=ctx.measureText(char).width;const u=smooth(start+i*.035,start+i*.035+.36,time);ctx.save();ctx.beginPath();ctx.rect(xx,y,width+2,size*1.6);ctx.clip();ctx.fillStyle=color;ctx.fillText(char,xx,y+(1-u)*size*1.6);ctx.restore();xx+=width});ctx.restore()}
function population(ctx,t,scene){
 const n=scene.count??480,selected=scene.selected??12,u=smooth(scene.start,scene.start+1.4,t);
 const focus=scene.mode==='focus'?u:0;
 for(let id=0;id<n;id++){
  const gold=id<selected,depth=.55+seeded(id+91)*.8;
  const x=130+seeded(id+11)*1660+Math.sin(t*.64+seeded(id+27)*5)*55*depth;
  const y=570+seeded(id+33)*310+Math.sin(x*.006-t*.9)*24*depth;
  const fx=1120+(id%4)*110+Math.sin(t*.9+id)*18,fy=565+Math.floor(id/4)*90+Math.cos(t*.7+id)*14;
  glowDot(ctx,gold?mix(x,fx,focus):x,gold?mix(y,fy,focus):y,gold?mix(4.4,7,focus):1.8+depth*.5,gold?'#e8c985':'#9da8b5',gold?.95:mix(.55,.23,focus));
 }
 if(scene.mode==='focus'){
  ctx.save();ctx.globalAlpha*=u;ctx.strokeStyle='#e8c985';ctx.lineWidth=2;ctx.strokeRect(1040,495,580,410);ctx.restore();
 }
 for(const label of scene.labels??[])riseLabel(ctx,label.text,label.x,label.y,t,scene.start+(label.delay??.3),label);
}
