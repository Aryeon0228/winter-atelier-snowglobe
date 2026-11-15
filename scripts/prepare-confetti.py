"""Build eight gift-pop variations entirely from user-provided VARCO samples."""
import array,hashlib,json,math,subprocess,sys,tempfile,wave
from pathlib import Path
rate=48000;out=Path('docs/assets/audio');out.mkdir(parents=True,exist_ok=True)
sources=[Path(p) for p in sys.argv[1:]]
assert len(sources)==3,'Provide spring GEN_2, spring GEN_1, then ding GEN_2'
data=[]
with tempfile.TemporaryDirectory() as temp:
 for i,p in enumerate(sources):
  target=Path(temp)/f'{i}.wav';subprocess.run(['ffmpeg','-v','error','-y','-i',str(p),'-ac','1','-ar',str(rate),str(target)],check=True)
  with wave.open(str(target)) as w:data.append(array.array('h',w.readframes(w.getnframes())))
def extract(source,start,end,speed):
 raw=data[source][round(start*rate):round(end*rate)];peak=max(map(abs,raw));first=next(i for i,v in enumerate(raw) if abs(v)>peak*.03);offset=max(0,first-round(.003*rate));raw=raw[offset:];peak=max(map(abs,raw));result=[]
 for i in range(int((len(raw)-1)/speed)):
  p=i*speed;j=int(p);v=(raw[j]*(1-(p-j))+raw[j+1]*(p-j))/peak
  envelope=min(1,i/(rate*.002),max(0,(len(raw)/speed-1-i)/(rate*.10)))
  result.append(v*envelope)
 return result,round(start+offset/rate,6)
recipes=[(0,0,.62,1.00,.92,.025,.34),(0,2.2,3.0,1.04,1.08,.065,.45),(0,4.2,4.98,.97,1.16,.015,.38),(1,0,.5,.96,1.00,.08,.32),(1,1.45,2.15,1.02,.88,.04,.46),(1,3.45,4.05,1.0,1.12,.06,.37),(1,5.25,5.95,1.06,.98,.018,.43),(1,7.15,7.8,.98,1.2,.09,.34)]
names=['통 · 챙','뽕 · 짤랑','팡 · 반짝','톡 · 챙','퐁 · 땡','팡 · 찡','뿅 · 챙','통 · 짤랑']
variants=[]
for i,(source,start,end,speed,ding_speed,delay,ding_gain) in enumerate(recipes):
 spring,actual_start=extract(source,start,end,speed);ding,ding_start=extract(2,0,.85,ding_speed);offset=round(delay*rate)
 mixed=[0.0]*max(len(spring),len(ding)+offset)
 for j,v in enumerate(spring):mixed[j]+=.65*v
 for j,v in enumerate(ding):mixed[j+offset]+=ding_gain*v
 rms=math.sqrt(sum(v*v for v in mixed)/len(mixed));gain=min(.065/rms,.65/max(map(abs,mixed)))
 samples=array.array('h',(round(v*gain*32767) for v in mixed));samples[0]=samples[-1]=0
 target=out/f'confetti-pop-{i+1:02}.wav'
 with wave.open(str(target),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(rate);w.writeframes(samples.tobytes())
 variants.append({'file':target.name,'label':names[i],'duration_seconds':round(len(samples)/rate,4),'spring':{'source':sources[source].name,'segment_seconds':[actual_start,end],'rate':speed,'mix_gain':.65},'ding':{'source':sources[2].name,'segment_seconds':[ding_start,.85],'rate':ding_speed,'delay_seconds':delay,'mix_gain':ding_gain},'output_gain':round(gain,6),'rms':round(math.sqrt(sum(v*v for v in samples)/len(samples))/32768,6),'peak':round(max(map(abs,samples))/32768,6),'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
manifest={'source_credit':'All source recordings generated with VARCO Sound and supplied by user. Eight variations edited/layered from those samples; no oscillator or noise synthesis.','sources':[{'file':p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sources],'editing':'Distinct spring transients; leading silence removed, short edge fades, small resampling/pitch changes; delayed ding layers, RMS matching with peak cap.','playback_gain':.55,'variants':variants}
(out/'confetti-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
for v in variants:print(v['file'],v['duration_seconds'],v['rms'],v['peak'])
