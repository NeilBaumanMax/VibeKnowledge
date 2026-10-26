// Continue the accepted aircraft scene; the missing aircraft stays outside the sample.
function drawAircraftReasoning(t){
 const fade=1-smooth(40.7,CONFIG.realWorldStart,t);
 const hx=660-149*.5,hy=650-35*.5;
 ctx.save();ctx.globalAlpha=fade;
 if(t<33.933333){
  const phase=(t-27.4)*1.8,alpha=.30+.25*Math.sin(phase)**2;
  ring(hx,hy,25+8*Math.sin(phase),alpha,'#ed8174');
 }
 riseLabel('Abraham Wald · 1943',260,330,36,'#c8d1dc',t,29.733333,(1-smooth(33.5,34,t)));
 riseLabel('估计中弹后的损失风险',245,880,36,'#c8d1dc',t,30.0,(1-smooth(33.5,34,t)));
 if(t>=33.933333){
  const draw=smooth(33.933333,35.0,t),a=(1-smooth(39.5,40.7,t));
  ctx.save();ctx.globalAlpha*=a;ctx.strokeStyle='#f3eee4';ctx.lineWidth=3;
  ctx.setLineDash([490*draw,490]);ctx.beginPath();ctx.roundRect(hx-36,hy-80,72,160,18);ctx.stroke();ctx.restore();
  riseLabel('发动机等关键部位',260,880,38,'#f3eee4',t,34.0,1-smooth(37.2,37.6,t));
 }
 riseLabel('还要考虑命中与损伤条件',205,880,34,'#c8d1dc',t,37.5,1-smooth(40.7,41.333333,t));
 ctx.restore();
}
