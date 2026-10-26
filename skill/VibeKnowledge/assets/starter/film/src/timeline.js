const canvas=document.getElementById('universe'),ctx=canvas.getContext('2d');
function draw(time){
 ctx.clearRect(0,0,1920,1080);background(ctx);
 for(const scene of CONFIG.scenes){if(time<scene.start||time>=scene.end)continue;ctx.save();ctx.globalAlpha*=scene.fadeIn?smooth(scene.start,scene.start+scene.fadeIn,time):1;ctx.globalAlpha*=scene.fadeOut?1-smooth(scene.end-scene.fadeOut,scene.end,time):1;drawScene(ctx,time,scene,CONFIG);ctx.restore();}
}
function mount(){
 const tl=gsap.timeline({paused:true}),clock={t:0};
 tl.to(clock,{t:RUNTIME.duration,duration:RUNTIME.duration,ease:'none',onUpdate:()=>draw(clock.t)},0);
 for(const cap of CAPTIONS){
  const base='#'+cap.id+' .caption';
  cap.lines.forEach((line,i)=>{
   const el=base+' p:nth-child('+(i+1)+')',at=cap.start+(cap.lineDelays?.[i]??0),n=Array.from(line).length;
   const duration=cap.kind==='reveal'?.25:.36,step=cap.kind==='reveal'?.025:Math.min(.045,.30/Math.max(1,n-1));
   if(cap.start===0&&i===0){
    tl.fromTo(el+' .char-mask:first-child .glyph',{yPercent:45,opacity:1},{yPercent:0,opacity:1,duration:.28,ease:'power3.out',immediateRender:true},0);
    tl.fromTo(el+' .char-mask:not(:first-child) .glyph',{yPercent:110,opacity:1},{yPercent:0,opacity:1,duration,ease:'power3.out',stagger:step,immediateRender:false},.04);
   }else tl.fromTo(el+' .glyph',{yPercent:110,opacity:1},{yPercent:0,opacity:1,duration,ease:'power3.out',stagger:step,immediateRender:false},at);
  });
  if(cap.english)tl.to(base+' .english',{opacity:1,duration:.35},cap.start+.1);
  if(cap.end<RUNTIME.duration)tl.to(base,{opacity:0,duration:.16},cap.end-.16);
 }
 window.__timelines=window.__timelines||{};window.__timelines.main=tl;draw(0);
}
window.addEventListener('hf-seek',event=>draw(event.detail.time));
document.fonts.ready.then(mount);
