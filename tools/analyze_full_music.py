from pathlib import Path
import numpy as np,json
from scipy.io import wavfile
from scipy.signal import stft,find_peaks,butter,sosfilt
from PIL import Image,ImageDraw
r=Path(__file__).resolve().parents[1];sr,x=wavfile.read(r/'review/full/music-analysis.wav');x=x.astype(float)/32768
f,t,z=stft(x,sr,nperseg=1024,noverlap=804);flux=np.maximum(0,np.diff(abs(z),axis=1)).sum(axis=0);ft=t[1:]-1.562811791383222
peaks,_=find_peaks(flux,distance=int(.24*sr/220),prominence=.15)
result={'excerpt_start':1.562811791383222,'onsets':[round(float(ft[i]),5) for i in peaks if 0<=ft[i]<=85], 'anchors':{}}
for target in [30,34,37.5,41,44.5,48,51.5,55,58.5,62,65.5,69,72.5,76]:
 ix=[i for i in peaks if abs(ft[i]-target)<.55]
 ix=sorted(ix,key=lambda i:flux[i],reverse=True)
 result['anchors'][str(target)]=[{'time':round(float(ft[i]),3),'strength':round(float(flux[i]),3)} for i in ix[:3]]
result['rms_seconds']=[round(float(np.sqrt(np.mean(x[i*sr:(i+1)*sr]**2))),4) for i in range(90)]
(r/'review/full/music-analysis.json').write_text(json.dumps(result,indent=2))
im=Image.new('RGB',(1700,650),'#0b1018');d=ImageDraw.Draw(im)
vals=flux/max(flux);d.line([(int(max(0,ft[i])/85*1600+50),int(520-vals[i]*450)) for i in range(len(vals)) if 0<=ft[i]<=85],fill='#e8c985',width=1)
for sec in range(0,86,5):
 xx=int(sec/85*1600+50);d.line((xx,50,xx,550),fill='#304050');d.text((xx,580),str(sec),fill='white')
d.text((50,20),'SPECTRAL ONSETS / VIDEO SECONDS (same source offset)',fill='white');im.save(r/'review/full/music-structure.png')
print(json.dumps(result['anchors'],indent=2))
