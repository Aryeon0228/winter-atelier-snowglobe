"""Trim the user-supplied Winter Snow Globe music at its quiet passage near 42s."""
import array,hashlib,json,math,subprocess,sys,wave
from pathlib import Path
source=Path(sys.argv[1]);out=Path('docs/assets/audio');out.mkdir(parents=True,exist_ok=True)
target=out/'winter-snow-globe-42s.wav'
subprocess.run(['ffmpeg','-v','error','-y','-i',str(source),'-t','42','-ac','2','-ar','48000','-af','afade=t=in:st=0:d=0.04,afade=t=out:st=41:d=1','-c:a','pcm_s16le',str(target)],check=True)
web=out/'winter-snow-globe-42s.mp3'
subprocess.run(['ffmpeg','-v','error','-y','-i',str(target),'-c:a','libmp3lame','-b:a','160k',str(web)],check=True)
with wave.open(str(target)) as w: duration=w.getnframes()/w.getframerate();samples=array.array('h',w.readframes(w.getnframes()))
manifest={'source_filename':source.name,'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'source_credit':'User-provided background music; generation service and prompt unrecorded.','file':web.name,'download_file':target.name,'duration_seconds':duration,'source_segment_seconds':[0,42],'editing':'Retain stereo; end in the quieter passage after 41 seconds; 40 ms fade-in and 1 s fade-out. Quiet pause between repetitions is intentional.','playback_gain':.16,'duck_gain_while_bell_active':.7,'rms':round(math.sqrt(sum(x*x for x in samples)/len(samples))/32768,6),'peak_dbfs':round(20*math.log10(max(map(abs,samples))/32768),2),'sha256':hashlib.sha256(web.read_bytes()).hexdigest(),'wav_sha256':hashlib.sha256(target.read_bytes()).hexdigest()}
(out/'music-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');print(json.dumps(manifest,ensure_ascii=False,indent=2))
