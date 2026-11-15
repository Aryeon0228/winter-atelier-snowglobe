"""Trim two independent strikes from the user-supplied VARCO bell file.
Usage: python3 scripts/trim-bell.py INPUT
ffmpeg detects the real codec (the supplied .wav is actually MP3).
"""
import array,hashlib,json,math,subprocess,sys,tempfile,wave
from pathlib import Path
source=Path(sys.argv[1]);out=Path('docs/assets/audio');out.mkdir(parents=True,exist_ok=True)
rate=48000
with tempfile.TemporaryDirectory(prefix='winter-bell-') as temp:
 decoded=Path(temp)/'decoded.wav'
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(source),'-ac','1','-ar',str(rate),'-c:a','pcm_s16le',str(decoded)],check=True)
 with wave.open(str(decoded)) as w:samples=array.array('h',w.readframes(w.getnframes()))
 variants=[]
 for name,start,duration in [('a',.12,1.10),('b',4.72,1.23)]:
  data=[x/32768 for x in samples[round(start*rate):round((start+duration)*rate)]]
  dc=sum(data)/len(data);attack=round(.006*rate);release=round(.34*rate)
  for i,x in enumerate(data):
   fadein=.5-.5*math.cos(math.pi*min(1,i/attack))
   fadeout=.5-.5*math.cos(math.pi*min(1,(len(data)-1-i)/release))
   data[i]=(x-dc)*fadein*fadeout
  rms=math.sqrt(sum(x*x for x in data)/len(data));peak=max(map(abs,data))
  gain=min(.075/rms,.65/peak)
  pcm=array.array('h',(round(max(-1,min(1,x*gain))*32767) for x in data))
  path=out/f'ornament-bell-{name}.wav'
  with wave.open(str(path),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(rate);w.writeframes(pcm.tobytes())
  variants.append({'file':path.name,'source_start_seconds':start,'source_end_seconds':round(start+duration,3),'duration_seconds':len(data)/rate,'fade_in_seconds':.006,'fade_out_seconds':.34,'gain_db':round(20*math.log10(gain),2),'peak_dbfs':round(20*math.log10(max(abs(x) for x in pcm)/32768),2),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
 manifest={'source_filename':source.name,'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'source_duration_seconds':len(samples)/rate,'source_service':'VARCO Sound — user-provided generated audio','input_codec_note':'The source filename ends in .wav, but the uploaded bytes are MP3; decoded before editing.','output_format':'PCM WAV, 48000 Hz, mono, 16-bit','editing':'Two distinct source passages; DC removal, short fade-in, smooth tail fade, matched RMS with peak headroom. No generated or added audio.','variants':variants}
 (out/'bell-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps(manifest,ensure_ascii=False,indent=2))
