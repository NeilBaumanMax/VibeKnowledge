import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(p,'utf8');
const config=JSON.parse(read('film/src/config.json'));
const captions=JSON.parse(read('film/src/captions.json'));
const previous=JSON.parse(read('review/full/source-before/src/captions.json'));
function context(source){const box={document:{getElementById:()=>({getContext:()=>({})})},Math,CONFIG:config};vm.createContext(box);vm.runInContext(source,box);return box;}
const current=context(read('film/src/particles.js')+'\n'+read('film/src/reality.js'));
const old=context(read('review/full/source-before/src/particles.js'));
const poses=`[0,2.8,5.5,9.5,14.8,17.5].map(t=>dots.map(p=>samplePose(p,t)))`;
const prefixSame=JSON.stringify(vm.runInContext(poses,current))===JSON.stringify(vm.runInContext(poses,old));
const motion=vm.runInContext(`[46,50,54,60.5,67].map(t=>{const distances=dots.slice(0,24).map(p=>{const a=everydayPose(p,t),b=everydayPose(p,t+.5);return Math.hypot(a.x-b.x,a.y-b.y)});return {time:t,moving:distances.filter(x=>x>.5).length,meanDistancePx:distances.reduce((a,b)=>a+b,0)/24};})`,current);
const reading=captions.flatMap(c=>c.lines.map((line,i)=>{const n=Array.from(line).length;const duration=c.id==='reveal'?.25:.36;const stagger=c.id==='reveal'?.025:Math.min(.045,.30/Math.max(1,n-1));const at=c.start+(c.lineDelays?.[i]||0);return {id:c.id,line,chineseChars:[...line].filter(x=>/[\u3400-\u9fff]/.test(x)).length,start:at,settled:at+duration+stagger*(n-1),hold:c.end-(c.end===78?0:.16)-at-duration-stagger*(n-1)};}));
const analysis=JSON.parse(read('review/full/music-analysis.json'));
const beatErrors=[17,29.733333,33.933333,41.333333,48.266667,61.866667,72.866667].map(t=>{const onset=analysis.onsets.reduce((best,x)=>Math.abs(x-t)<Math.abs(best-t)?x:best);return {edit:t,onset,errorMs:Math.abs(t-onset)*1000};});
const checks={
  durationAndEnding:config.duration===78&&captions.at(-1).end===78,
  firstTenCaptionsPreserved:JSON.stringify(captions.slice(0,10))===JSON.stringify(previous.slice(0,10)),
  introSamplePositionsPreserved:prefixSame,
  allNewSamplePointsMoving:motion.every(x=>x.moving===24),
  chineseLinesAtMost18:reading.every(x=>x.chineseChars<=18),
  newCaptionsReadableHold:reading.filter(x=>x.start>=29.7).every(x=>x.hold>=2.3),
  keyBeatErrorUnderHalfFrame:beatErrors.every(x=>x.errorMs<=1000/60)
};
const report={checks,passed:Object.values(checks).filter(Boolean).length,failed:Object.values(checks).filter(x=>!x).length,motion,reading,beatErrors};
fs.writeFileSync('review/full/logic-review.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({checks,passed:report.passed,failed:report.failed,motion,beatErrors},null,2));
if(report.failed)process.exitCode=1;
