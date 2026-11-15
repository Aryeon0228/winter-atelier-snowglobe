"""Prepare supplied mailbox/landing transients, keeping originals untouched."""
import array,hashlib,json,math,subprocess,sys,tempfile,wave
from pathlib import Path
out=Path('docs/assets/audio');out.mkdir(parents=True,exist_ok=True)
records=[]
for filename,source_path,start,end in [('mailbox-open.wav',sys.argv[1],0,.85),('snowman-land.wav',sys.argv[2],.06,1.55)]:
 source=Path(source_path)
 with tempfile.TemporaryDirectory() as temp:
  decoded=Path(temp)/'source.wav'
  subprocess.run(['ffmpeg','-v','error','-y','-i',str(source),'-ac','1','-ar','48000',str(decoded)],check=True)
  with wave.open(str(decoded)) as w:rate=w.getframerate();data=array.array('h',w.readframes(w.getnframes()))
  samples=data[round(start*rate):round(end*rate)];level=.6*32767/max(map(abs,samples));fade_in=round(.002*rate);fade_out=round(.14*rate)
  for i,v in enumerate(samples):
   envelope=min(1,i/fade_in,max(0,(len(samples)-1-i)/fade_out));samples[i]=round(v*level*envelope)
  target=out/filename
  with wave.open(str(target),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(rate);w.writeframes(samples.tobytes())
  assert samples[0]==samples[-1]==0
  records.append({'file':filename,'source_filename':source.name,'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'source_segment_seconds':[start,end],'duration_seconds':len(samples)/rate,'format':'PCM WAV, mono, 48000 Hz, 16-bit','editing':'Trim quiet tail; remove 60 ms leading silence for landing only; peak matched to 0.6; 2 ms fade-in / 140 ms fade-out.','playback_gain':.6,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
manifest={'source_credit':'User-provided sound effects; generation service and prompts not independently recorded.','clips':records}
(out/'action-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');print(json.dumps(manifest,ensure_ascii=False,indent=2))
