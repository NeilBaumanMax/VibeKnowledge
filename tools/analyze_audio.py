from pathlib import Path
import numpy as np,json
from scipy.io import wavfile
from scipy.signal import stft, find_peaks, butter, sosfilt
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parents[1]
sr,x=wavfile.read(root/'review/music-analysis.wav');x=x.astype(float)/32768
hop=220
rms=np.sqrt(np.mean(x[:len(x)//hop*hop].reshape(-1,hop)**2,axis=1));times=(np.arange(len(rms))+.5)*hop/sr
low=sosfilt(butter(3,[35,180],btype='bandpass',fs=sr,output='sos'),x)
bass=np.sqrt(np.mean(low[:len(low)//hop*hop].reshape(-1,hop)**2,axis=1))
f,t,z=stft(x,sr,nperseg=1024,noverlap=804)
flux=np.maximum(0,np.diff(abs(z),axis=1)).sum(axis=0);ft=t[1:]
peaks,_=find_peaks(bass,distance=int(.28*sr/hop),prominence=max(bass)*.06)
strong=sorted(peaks,key=lambda i:bass[i],reverse=True)
near=[i for i in peaks if 14<times[i]<20]
result={'duration_analyzed':len(x)/sr,'source_sample_rate_analysis':sr,'bass_peaks_first_35':[{'t':round(float(times[i]),3),'strength':round(float(bass[i]),4)} for i in peaks if times[i]<35],'reveal_candidates':[{'t':round(float(times[i]),3),'strength':round(float(bass[i]),4)} for i in near], 'rms_per_second':[round(float(np.sqrt(np.mean(x[i*sr:(i+1)*sr]**2))),4) for i in range(int(len(x)/sr))]}
(root/'review/audio-analysis.json').write_text(json.dumps(result,indent=2))
im=Image.new('RGB',(1600,600),'#0b1018');d=ImageDraw.Draw(im)
for vals,y,col in [(rms,250,'#e8c985'),(bass,510,'#ea786a')]:
    v=vals/max(vals);p=[(int(times[i]/70*1520+40),int(y-v[i]*200)) for i in range(len(v))];d.line(p,fill=col,width=2)
for s in range(0,71,5):
    u=int(s/70*1520+40);d.line((u,20,u,550),fill='#28303c');d.text((u,565),str(s),fill='white')
d.text((45,25),'RMS / SOURCE SECONDS',fill='white');d.text((45,280),'LOW FREQUENCY ENERGY 35-180 Hz',fill='white');im.save(root/'review/audio-waveform.png')
print(json.dumps(result,indent=2))
