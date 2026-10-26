// In-scene labels establish the visual vocabulary before asking viewers to infer it.
// Characters rise through baseline masks, matching the main subtitle language.
function riseLabel(text,x,y,size,color,t,start,alpha=1){
 if(t<start||alpha<=0)return;
 ctx.save();ctx.font=size+'px Display';ctx.textBaseline='alphabetic';ctx.fillStyle=color;
 const chars=Array.from(text),step=Math.min(.026,.18/Math.max(1,chars.length-1));
 let offset=0;
 for(let i=0;i<chars.length;i++){
  const width=ctx.measureText(chars[i]).width+1,progress=clamp((t-start-i*step)/.28),ease=1-Math.pow(1-progress,3);
  if(progress>0){ctx.save();ctx.globalAlpha*=alpha;ctx.beginPath();ctx.rect(x+offset,y,width+1,size*1.35);ctx.clip();ctx.fillText(chars[i],x+offset,y+size*.96+(1-ease)*size*1.35);ctx.restore();}
  offset+=width;
 }
 ctx.restore();
}
function drawSampleMeanings(t,hush){
 if(t>=19.15)return;
 const b=windowPose(t),c=cameraAt(t);
 // Label belongs to the moving observation frame, not a disconnected corner legend.
 const preReveal=1-smooth(16.1,16.6,t);
 riseLabel('你看到的成功者',b.x+14,b.y-68,44,'#e8c985',t,.85,preReveal*hush);
 const focus=1-smooth(3.9,4.65,t)+smooth(7.2,8.6,t);
 riseLabel('没被看见的失败者',140,610+(c.z-1)*120,44,'#b0bac9',t,2.15,clamp(focus)*preReveal*hush);
 // A short first-use explanation links an abstract dot to a person.
 riseLabel('每个点，都是一个人',140,585,40,'#c5ced9',t,.15,(1-smooth(1.75,2.05,t))*hush);
 riseLabel('完整样本',b.x+16,b.y-59,36,'#e8c985',t,17.4,(1-smooth(18.65,19.1,t))*hush);
}
