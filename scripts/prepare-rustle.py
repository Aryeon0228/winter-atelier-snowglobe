"""Prepare the supplied VARCO tree rustle without changing its duration."""
import array,hashlib,json,math,subprocess,sys,tempfile,wave
from pathlib import Path
source=Path(sys.argv[1]);out=Path('docs/assets/audio');out.mkdir(parents=True,exist_ok=True)
with tempfile.TemporaryDirectory(prefix='winter-rustle-') as temp:
 decoded=Path(temp)/'decoded.wav'
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(source),'-ac','1','-ar','48000','-c:a','pcm_s16le',str(decoded)],check=True)
 with wave.open(str(decoded)) as w:rate=w.getframerate();duration=w.getnframes()/rate
 target=out/'tree-rustle.wav'
 filters=f'highpass=f=80,lowpass=f=4800,volume=0.75,afade=t=in:st=0:d=0.015,afade=t=out:st={duration-.18:.6f}:d=0.18'
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(decoded),'-af',filters,'-c:a','pcm_s16le',str(target)],check=True)
 with wave.open(str(target)) as w:samples=array.array('h',w.readframes(w.getnframes()))
 rms=math.sqrt(sum(x*x for x in samples)/len(samples))/32768
 manifest={'source_filename':source.name,'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'source_service':'VARCO Sound — user-provided generated audio','file':target.name,'duration_seconds':duration,'format':'PCM WAV, 48000 Hz, mono, 16-bit','editing':'Full duration retained; gentle high-pass 80 Hz / low-pass 4800 Hz, amplitude x0.75, 15 ms fade-in / 180 ms fade-out.','playback_gain':.55,'bell_playback_gain':.65,'duck_gain_while_bell_active':.55,'rms':round(rms,6),'peak_dbfs':round(20*math.log10(max(map(abs,samples))/32768),2),'sha256':hashlib.sha256(target.read_bytes()).hexdigest()}
 (out/'rustle-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');print(json.dumps(manifest,ensure_ascii=False,indent=2))
