// Purpose-drawn twin-engine aircraft. Not a historical aircraft model or dataset.
const AIRFRAME_PATH='M500 18 C476 20 472 63 470 110 L464 212 L72 355 L54 410 L463 325 L476 477 L322 545 L321 581 L484 557 L500 590 L516 557 L679 581 L678 545 L524 477 L537 325 L946 410 L928 355 L536 212 L530 110 C528 63 524 20 500 18 Z';
let holesCache;
function holePositions(){
 if(holesCache)return holesCache;
 const test=document.createElement('canvas').getContext('2d');const path=new Path2D(AIRFRAME_PATH);let out=[];
 for(const side of [-1,1])for(const tail of [false,true]){
  const count=tail?8:23;let j=0,n=0;
  while(n<count&&j<10000){j++;let u=seeded(j+(tail?932:43)),v=seeded(j+(tail?1921:559));
   let x=500+side*(tail?40+u*145:85+u*345),y=tail?495+v*82:245+v*155;
   let engine=(x>319&&x<385||x>615&&x<681)&&y<367;
   if(!engine&&test.isPointInPath(path,x,y)){out.push({x,y});n++;}
  }
 }
 holesCache=out;return out;
}
function paintAircraft(x,y,scale,color,hits,critical=0,rotation=0){
 ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.scale(scale,scale);ctx.translate(-500,-300);
 const path=new Path2D(AIRFRAME_PATH);ctx.fillStyle=color==='#e8c985'?'#182028':'#101923';ctx.fill(path);ctx.strokeStyle=color;ctx.lineWidth=3;ctx.stroke(path);
 ctx.globalAlpha*=.65;line(500,40,500,565,color,1.2);line(80,384,463,274,color,1.2);line(920,384,537,274,color,1.2);ctx.globalAlpha/=.65;
 ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.beginPath();ctx.roundRect(332,208,40,145,18);ctx.roundRect(628,208,40,145,18);ctx.stroke();line(306,221,398,221,color,2.5);line(602,221,694,221,color,2.5);
 ctx.beginPath();ctx.moveTo(478,88);ctx.quadraticCurveTo(500,62,522,88);ctx.lineTo(525,130);ctx.quadraticCurveTo(500,111,475,130);ctx.closePath();ctx.stroke();
 for(let i=0;i<holePositions().length;i++){const p=holePositions()[i],a=clamp(hits*holePositions().length-i);if(a<=0)continue;ctx.save();ctx.globalAlpha*=a;ctx.fillStyle='#ed8174';ctx.beginPath();ctx.arc(p.x,p.y,4.2,0,Math.PI*2);ctx.fill();ctx.restore();}
 if(critical>0){ctx.save();ctx.globalAlpha*=critical;ctx.strokeStyle='#ed8174';ctx.lineWidth=4;ctx.beginPath();ctx.roundRect(322,194,60,173,22);ctx.stroke();ctx.fillStyle='#ed8174';ctx.beginPath();ctx.arc(351,265,11,0,Math.PI*2);ctx.fill();ctx.restore();}
 ctx.restore();
}
function drawAircraftExperiment(t){
 const appear=smooth(19.15,19.55,t);ctx.save();ctx.globalAlpha=appear;
 // This aircraft visibly crosses the observation boundary before its damage is tallied.
 const arrival=smooth(19.45,20.7,t);const px=mix(560,1420,arrival),py=mix(590,610,arrival),sc=mix(.29,.61,arrival);
 routeCurve(400,590,1420,610,'#a4b2c4',.27);
 const returned=arrival>.9;
 paintAircraft(px,py,sc,returned?'#e8c985':'#d0d5dd',smooth(20.75,21.8,t),0,(1-arrival)*Math.PI*.5);
 if(t>=20.8){ctx.save();ctx.strokeStyle='#e8c985';ctx.lineWidth=1.5;ctx.globalAlpha=.5*(1-smooth(27.4,28,t));for(let yy of [822,836,850])line(1280,yy,1560,yy,'#e8c985',1);ctx.restore();sampleMark(1690,380,true,13,.9);}
 // Tempting hypothesis is shown, held, then withdrawn after the missing case arrives.
 const hypothesis=smooth(22.4,22.9,t)*(1-smooth(24.8,25.1,t));
 if(hypothesis>0){ctx.save();ctx.globalAlpha=hypothesis*.65;ctx.translate(1420,610);ctx.scale(.61,.61);ctx.translate(-500,-300);ctx.strokeStyle='#ed8174';ctx.lineWidth=3;ctx.setLineDash([12,10]);ctx.beginPath();ctx.moveTo(95,362);ctx.lineTo(430,250);ctx.lineTo(435,320);ctx.lineTo(85,394);ctx.closePath();ctx.moveTo(905,362);ctx.lineTo(570,250);ctx.lineTo(565,320);ctx.lineTo(915,394);ctx.closePath();ctx.stroke();ctx.restore();}
 // A second aircraft follows the same prospective return route, but stops short after an engine hit.
 if(t>=24.7){const enter=smooth(24.7,25.05,t),hit=smooth(25.05,25.17,t),fall=smooth(25.35,26.8,t);let x=mix(500,660,fall),y=mix(545,650,fall);ctx.save();ctx.globalAlpha=enter;
  ctx.save();ctx.strokeStyle='#8794a6';ctx.setLineDash([9,12]);ctx.globalAlpha=.38;ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(520,550);ctx.bezierCurveTo(760,550,930,610,1080,610);ctx.stroke();ctx.restore();
  paintAircraft(x,y,.50,fall>.15?'#8b98ab':'#d0d5dd',0,hit,fall*-.12);
  if(hit>0){const hx=x-149*.5,hy=y-35*.5;const travel=smooth(24.78,25.06,t);line(mix(240,hx,travel),mix(360,hy,travel),hx,hy,'#ed8174',2);ring(hx,hy,14+clamp((t-25.06)/.55)*40,Math.max(0,1-(t-25.06)/.65),'#ed8174');}
  // Interrupted path curves down; the failed aircraft stays visible, outside the sample window.
  if(fall>0){ctx.save();ctx.globalAlpha=.5;routeCurve(500,545,x,y,'#8b98ab',fall);ctx.restore();}
  if(t>26.3)sampleMark(920,640,false,13,smooth(26.3,26.6,t));
  ctx.restore();
 }
 // At the close, planes retain their outcomes and visually reconnect with the original cohorts.
 if(t>=27.4){const a=smooth(27.4,28.3,t);routeCurve(660,750,600,880,'#8b98ab',a*.5);routeCurve(1420,790,1390,850,'#e8c985',a*.5);}
 ctx.restore();
}
