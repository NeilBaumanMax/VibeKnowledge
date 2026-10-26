from pathlib import Path
import subprocess,json,sys,math
from PIL import Image,ImageDraw
import numpy as np
r=Path(__file__).resolve().parents[1];video=r/(sys.argv[1] if len(sys.argv)>1 else 'output/幸存者偏差_30秒样片.mp4');review=r/(sys.argv[2] if len(sys.argv)>2 else 'review');review.mkdir(exist_ok=True,parents=True);ff=r/'tools/bin/ffmpeg';probe=r/'tools/bin/ffprobe'
info=json.loads(subprocess.check_output([str(probe),'-v','error','-count_frames','-show_streams','-show_format','-of','json',str(video)]));(review/'output-probe.json').write_text(json.dumps(info,indent=2))
v=next(x for x in info['streams'] if x['codec_type']=='video');a=next(x for x in info['streams'] if x['codec_type']=='audio')
expected=float(sys.argv[3]) if len(sys.argv)>3 else 30
assert v['width']==1920 and v['height']==1080
assert v['r_frame_rate']=='30/1' and int(v['nb_read_frames'])==round(expected*30)
assert abs(float(info['format']['duration'])-expected)<.08
assert a['channels']==2
subprocess.run([str(ff),'-v','error','-i',str(video),'-f','null','-'],check=True,capture_output=True)
times=[0,1.6,2.8,5.5,7.6,9.5,12.5,14.8,16.6,17,17.5,20,22,24.6,25.2,26.8,28.4,29.9666667]
if expected>30:times=times[:-2]+[28.4,31.5,35.5,39,42.5,46,50,54,57,60.5,64,67,70,73.5,76,expected-1/30]
folder=review/'final-frames';folder.mkdir(exist_ok=True)
sheet=Image.new('RGB',(1600,math.ceil(len(times)/4)*251),(16,18,23));d=ImageDraw.Draw(sheet);brightness=[]
for i,t in enumerate(times):
 p=folder/f'{i:02d}_{t:.3f}.png';subprocess.run([str(ff),'-v','error','-ss',str(t),'-i',str(video),'-frames:v','1','-y',str(p)],check=True)
 im=Image.open(p).convert('RGB');pix=np.asarray(im);brightness.append({'time':t,'mean':float(pix.mean()),'bright_pixels':int((pix.max(axis=2)>150).sum())})
 im.thumbnail((400,225));xx=i%4*400;yy=i//4*251;sheet.paste(im,(xx,yy+26));d.text((xx+8,yy+7),f'{t:.3f}s',fill='white')
sheet.save(review/'成片关键帧.jpg')
report={'passed':True,'duration':float(info['format']['duration']),'width':v['width'],'height':v['height'],'frames':int(v['nb_read_frames']),'fps':v['r_frame_rate'],'video_codec':v['codec_name'],'pixel_format':v['pix_fmt'],'audio_codec':a['codec_name'],'audio_channels':a['channels'],'audio_sample_rate':a['sample_rate'],'size_bytes':video.stat().st_size,'full_decode':'pass','sampled_frames':brightness}
(review/'technical-validation.json').write_text(json.dumps(report,indent=2));print(json.dumps({k:v for k,v in report.items() if k!='sampled_frames'},indent=2))
