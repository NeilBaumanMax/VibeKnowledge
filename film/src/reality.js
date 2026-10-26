// Return to everyday claims using explicit names, one method, and two outcomes.
// Demonstration cases are not an empirical success-rate estimate.
function lightPoint(x,y,r,gold,alpha=1){
 ctx.save();ctx.globalAlpha*=alpha;
 if(gold){const glow=ctx.createRadialGradient(x,y,0,x,y,r*5);glow.addColorStop(0,'rgba(232,201,133,.35)');glow.addColorStop(1,'rgba(232,201,133,0)');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,y,r*5,0,Math.PI*2);ctx.fill();}
 ctx.fillStyle=gold?'#e8c985':'#a6b3c4';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.restore();
}
function everydayPose(p,t){const k=p.gold?p.id:p.id-12;return {x:(p.gold?1190:380)+(k%4)*90+Math.sin(t*.85+p.id)*22,y:590+Math.floor(k/4)*78+Math.cos(t*.7+p.id)*17};}
function fullPopulationPose(p,t){const q=worldSample({...p,gold:false},t),z=1-.13*smooth(70,77,t);return {x:960+(q.x-960)*z,y:800+(q.y-800)*z,r:p.gold?5.5:2.1};}
function drawReality(t){
 const start=CONFIG.realWorldStart,enter=smooth(start,start+1.3,t),ending=smooth(CONFIG.endingStart,70.8,t);
 // Same positions and colours bridge the aircraft and human samples.
 if(enter<1){ctx.save();ctx.globalAlpha=1-enter;observationWindow(30,1);drawAircraftExperiment(27.35,1-enter);ctx.restore();}
 ctx.save();ctx.globalAlpha=enter;
 if(ending<1){
  const remain=1-smooth(68.35,CONFIG.endingStart,t);
  const method=smooth(44.2,44.8,t);
  if(method<1){for(const [label,x] of [['上岸经验',360],['创业故事',800],['爆款方法',1240]])riseLabel(label,x,345,42,'#e8c985',t,start+.25,1-method);}
  riseLabel('同一种方法',825,315,48,'#f3eee4',t,44.5,remain);
  // Rectangles keep the same meaning throughout: the cases included in observation.
  const selected=smooth(51.7,52.4,t),all=smooth(58.7,60.2,t);
  if(selected>0){
   const x=mix(1050,220,all),w=mix(630,1480,all);
   ctx.save();ctx.globalAlpha*=selected*remain;ctx.strokeStyle='#e8c985';ctx.lineWidth=2;ctx.strokeRect(x,440,w,430);ctx.restore();
   riseLabel(all<.5?'你只听到的':'把两种结果一起看',x+16,389,34,'#e8c985',t,all<.5?51.7:59.45,remain);
  }
  riseLabel('失败者',445,475,42,'#a6b3c4',t,start+.4,remain);
  riseLabel('成功者',1255,475,42,'#e8c985',t,start+.4,remain);
  riseLabel('原理示意 · 数量不代表真实比例',140,965,28,'#a6b3c4',t,start+.7,remain);
  riseLabel('起点 · 资源 · 时机',700,916,40,'#c8d1dc',t,65.4,remain);
 }
 for(const p of dots){
  if(p.id>=24&&ending<=0)continue;
  const end=fullPopulationPose(p,t),q=p.id<24?everydayPose(p,t):end;
  const x=mix(q.x,end.x,ending),y=mix(q.y,end.y,ending),r=mix(7,end.r,ending);
  let alpha=p.gold?1:.35;
  if(!p.gold){alpha=mix(.25,.8,smooth(48.266667,49.4,t));alpha=mix(alpha,.28,smooth(51.7,52.4,t));alpha=mix(alpha,.78,smooth(58.7,60.2,t));}
  if(p.id>=24)alpha=(.25+seeded(p.id+91)*.39)*ending;
  alpha*=1-.4*smooth(75.3,78,t);
  lightPoint(x,y,r,p.gold,alpha);
  if(p.id<24&&ending<1){
   const local=p.gold?p.id:p.id-12,at=(p.gold?44.8:48.266667)+local*.085;
   const result=smooth(at,at+.35,t)*(1-ending);
   sampleMark(x,y,p.gold,16,result*.8);
   if(!p.gold&&t>=61.866667&&t<65.4){const a=Math.sin((t-61.866667)*1.6)**2;ring(x,y,24,a*.35*(1-ending),'#b9c6d6');}
  }
 }
 if(ending>0){riseLabel('幸存者偏差',850,575,34,'#b2bdcc',t,71,1-smooth(76.8,78,t));}
 ctx.restore();
}
