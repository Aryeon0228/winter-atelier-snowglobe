import bellManifest from '../docs/assets/audio/bell-manifest.json' with {type:'json'};
export const BELL_URLS=bellManifest.variants.map(v=>'assets/audio/'+v.file+'?v='+v.sha256.slice(0,10));

export function createSceneAudio({contextFactory=()=>new (globalThis.AudioContext||globalThis.webkitAudioContext)(),fetcher=(...args)=>fetch(...args),random=Math.random}={}){
  let context=null,master=null,enabled=false,revision=0,buffers=null,loading=null,lastVariant=-1,lastBellTime=-Infinity;
  const voices=new Set();
  function ensureContext(){if(!context){context=contextFactory();master=context.createGain();master.gain.value=0;master.connect(context.destination);}return context;}
  function track(source,gain,kind){const voice={source,gain,kind};voices.add(voice);source.onended=()=>{source.disconnect();gain.disconnect();voices.delete(voice);};return voice;}
  function stopVoice(voice){try{voice.source.stop();}catch{}voice.source.disconnect();voice.gain.disconnect();voices.delete(voice);}
  function load(){
    if(buffers)return Promise.resolve(buffers);
    if(!loading)loading=Promise.all(BELL_URLS.map(async url=>{const response=await fetcher(url);if(!response.ok)throw Error('Bell audio could not be loaded');return context.decodeAudioData(await response.arrayBuffer());})).then(value=>{buffers=value;return value;}).catch(error=>{loading=null;throw error;});
    return loading;
  }
  return {
    async setEnabled(value){
      const token=++revision;enabled=false;
      if(!value){if(master)master.gain.value=0;for(const voice of [...voices])stopVoice(voice);return false;}
      try{
        const ctx=ensureContext();
        // Resume synchronously from the sound-button gesture, before waiting on downloads.
        await ctx.resume();if(token!==revision)return false;
        await load();if(token!==revision)return false;
        master.gain.value=.7;enabled=true;lastBellTime=-Infinity;return true;
      }catch(error){if(token===revision){enabled=false;if(master)master.gain.value=0;}throw error;}
    },
    playBell(){
      if(!enabled||!buffers||context.state!=='running')return false;
      const time=context.currentTime;if(time-lastBellTime<.08)return false;
      const active=[...voices].filter(v=>v.kind==='bell');if(active.length>=3)stopVoice(active[0]);
      const index=lastVariant<0?(random()<.5?0:1):1-lastVariant;
      const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffers[index];gain.gain.value=.65;source.connect(gain);gain.connect(master);track(source,gain,'bell');source.start(time);
      lastVariant=index;lastBellTime=time;return true;
    },
    chime(){
      if(!enabled||context.state!=='running')return;
      // Preserve the pre-existing synthesized cue on interactions awaiting supplied audio.
      for(const voice of [...voices].filter(v=>v.kind==='chime'))stopVoice(voice);
      [880,1174.66,1567.98].forEach((frequency,i)=>{
        const source=context.createOscillator(),gain=context.createGain(),time=context.currentTime+i*.09;source.type='sine';source.frequency.value=frequency;
        gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(.045,time+.012);gain.gain.exponentialRampToValueAtTime(.0001,time+.8);source.connect(gain);gain.connect(master);track(source,gain,'chime');source.start(time);source.stop(time+.85);
      });
    },
    get enabled(){return enabled;},
  };
}
