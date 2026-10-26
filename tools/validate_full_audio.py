from pathlib import Path
import subprocess, json
import numpy as np
from scipy.signal import correlate, correlation_lags

root=Path(__file__).resolve().parents[1]
ff=root/'tools/bin/ffmpeg'
folder=root/'review/full'
video=root/'output/完整版/幸存者偏差_完整版.mp4'
old=root/'output/幸存者偏差_30秒样片_v4.mp4'
rate=24000
def pcm(path, duration):
    raw=subprocess.check_output([str(ff),'-v','error','-i',str(path),'-t',str(duration),'-vn','-ac','1','-ar',str(rate),'-f','f32le','-'])
    return np.frombuffer(raw,dtype='<f4')
current=pcm(video,78)
previous=pcm(old,27)
correlation=float(np.corrcoef(current[:len(previous)],previous)[0,1])
a=current[16*rate:18*rate];b=previous[16*rate:18*rate]
cross=correlate(a,b,method='fft');lags=correlation_lags(len(a),len(b))
near=np.abs(lags)<rate*.1
lag=int(lags[near][np.argmax(cross[near])])
blocks=[{'start':s,'rms':float(np.sqrt(np.mean(current[int(s*rate):int((s+.25)*rate)]**2)))} for s in np.arange(29,31,.25)]
checks={'sampleMusicAlignment':abs(lag)<=1 and correlation>.98,
        'noSilenceAtThirtySeconds':all(x['rms']>.003 for x in blocks),
        'fullAudioLength':len(current)>=round(77.99*rate)}
report={'checks':checks,'first27SecondsCorrelation':correlation,'alignmentLagSamples':lag,'sampleRate':rate,'aroundThirtySeconds':blocks}
(folder/'audio-validation.json').write_text(json.dumps(report,indent=2))
with (folder/'loudness.log').open('w') as log:
    subprocess.run([str(ff),'-hide_banner','-i',str(video),'-vn','-af','ebur128=peak=true','-f','null','-'],stdout=log,stderr=log,check=True)
print(json.dumps(report,indent=2))
assert all(checks.values())
