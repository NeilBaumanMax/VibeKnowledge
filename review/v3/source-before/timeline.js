const tl=gsap.timeline({paused:true});
const clockState={t:0};
tl.to(clockState,{t:30,duration:30,ease:'none',onUpdate:()=>drawParticles(clockState.t)},0);
window.addEventListener('hf-seek',e=>drawParticles(e.detail.time));
for(const cap of CAPTIONS){
 const base='#'+cap.id+' .caption';
 cap.lines.forEach((_,i)=>{
  const el=base+' p:nth-child('+(i+1)+')',at=cap.start+(cap.lineDelays?.[i]||0);
  if(cap.id==='hook')tl.set(el,{opacity:1,y:0},0);
  else if(cap.id==='reveal'){
   tl.set(el,{opacity:1},at);tl.fromTo(el,{scale:1.08},{scale:1,duration:.3,ease:'power4.out',immediateRender:false},at);
  }else tl.fromTo(el,{opacity:0,y:16},{opacity:1,y:0,duration:.32,ease:'power2.out',immediateRender:false},at);
 });
 if(cap.english)tl.to(base+' .english',{opacity:1,duration:.35},cap.start+.1);
 if(cap.end<30)tl.to(base,{opacity:0,duration:.16,ease:'power2.in'},cap.end-.16);
}
tl.fromTo('#tag1,#tag2,#tag3',{opacity:0,y:12},{opacity:1,y:0,stagger:.17,duration:.35},4.25);
tl.to('#tag1,#tag2,#tag3',{opacity:0,duration:.3},6.95);
tl.fromTo('#flash',{opacity:.10},{opacity:0,duration:.24,ease:'power2.out',immediateRender:false},17);
tl.to('#returnedLabel,#illustrationNote',{opacity:1,duration:.4},20.65);
tl.to('#missingLabel',{opacity:1,duration:.4},26.3);
window.__timelines=window.__timelines||{};
window.__timelines.main=tl;
drawParticles(0);
