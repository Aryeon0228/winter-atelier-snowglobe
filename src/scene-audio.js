import bellManifest from '../docs/assets/audio/bell-manifest.json' with {type:'json'};
import rustleManifest from '../docs/assets/audio/rustle-manifest.json' with {type:'json'};
import musicManifest from '../docs/assets/audio/music-manifest.json' with {type:'json'};
import actionManifest from '../docs/assets/audio/action-manifest.json' with {type:'json'};
import confettiManifest from '../docs/assets/audio/confetti-manifest.json' with {type:'json'};
export const BELL_URLS=bellManifest.variants.map(v=>'assets/audio/'+v.file+'?v='+v.sha256.slice(0,10));
export const RUSTLE_URL='assets/audio/'+rustleManifest.file+'?v='+rustleManifest.sha256.slice(0,10);
export const MUSIC_URL='assets/audio/'+musicManifest.file+'?v='+musicManifest.sha256.slice(0,10);
export const ACTION_URLS=actionManifest.clips.map(v=>'assets/audio/'+v.file+'?v='+v.sha256.slice(0,10));
export const CONFETTI_URLS=confettiManifest.variants.map(v=>'assets/audio/'+v.file+'?v='+v.sha256.slice(0,10));
export const AUDIO_URLS=[...BELL_URLS,RUSTLE_URL,MUSIC_URL,...ACTION_URLS,...CONFETTI_URLS];

export function createSceneAudio({contextFactory=()=>new (globalThis.AudioContext||globalThis.webkitAudioContext)(),fetcher=(...args)=>fetch(...args),random=Math.random}={}){
  let context=null,master=null,rustleBus=null,musicBus=null,musicEnabled=false,effectsEnabled=false,musicRequested=false,effectsRequested=false,revision=0,buffers=null,loading=null,lastVariant=-1,lastBellTime=-Infinity,lastRustleTime=-Infinity;
  const voices=new Set(),lastActionTime=new Map();
  let confettiBag=[],lastConfetti=-1;
  const isForeground=kind=>['bell','mailbox','landing','confetti'].includes(kind);
  function ensureContext(){if(!context){context=contextFactory();master=context.createGain();master.gain.value=0;master.connect(context.destination);rustleBus=context.createGain();rustleBus.gain.value=1;rustleBus.connect(master);musicBus=context.createGain();musicBus.gain.value=1;musicBus.connect(master);}return context;}
  function updateDucking(){
    const bellActive=[...voices].some(v=>v.kind==='bell'),foregroundActive=[...voices].some(v=>isForeground(v.kind));
    if(rustleBus)rustleBus.gain.setTargetAtTime(bellActive?rustleManifest.duck_gain_while_bell_active:1,context.currentTime,bellActive?.012:.16);
    if(musicBus)musicBus.gain.setTargetAtTime(foregroundActive?musicManifest.duck_gain_while_bell_active:1,context.currentTime,foregroundActive?.04:.3);
  }
  function startMusic(){
    for(const voice of [...voices].filter(v=>v.kind==='music'))stopVoice(voice);
    const source=context.createBufferSource(),gain=context.createGain();
    source.buffer=buffers[3];source.loop=true;source.loopStart=0;source.loopEnd=musicManifest.duration_seconds;
    gain.gain.value=musicManifest.playback_gain;source.connect(gain);gain.connect(musicBus);track(source,gain,'music');updateDucking();source.start(context.currentTime);
  }
  function track(source,gain,kind){const voice={source,gain,kind};voices.add(voice);source.onended=()=>{source.disconnect();gain.disconnect();voices.delete(voice);if(isForeground(kind))updateDucking();};return voice;}
  function stopVoice(voice){try{voice.source.stop();}catch{}voice.source.disconnect();voice.gain.disconnect();voices.delete(voice);if(isForeground(voice.kind))updateDucking();}
  function playAction(index,kind){
    if(!effectsEnabled||!buffers||context.state!=='running')return false;
    const time=context.currentTime;if(time-(lastActionTime.get(kind)??-Infinity)<.15)return false;
    for(const voice of [...voices].filter(v=>v.kind===kind))stopVoice(voice);
    const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffers[4+index];gain.gain.value=actionManifest.clips[index].playback_gain;
    source.connect(gain);gain.connect(master);track(source,gain,kind);updateDucking();source.start(time);lastActionTime.set(kind,time);return true;
  }
  function load(){
    if(buffers)return Promise.resolve(buffers);
    if(!loading)loading=Promise.all(AUDIO_URLS.map(async url=>{const response=await fetcher(url);if(!response.ok)throw Error('Scene audio could not be loaded');return context.decodeAudioData(await response.arrayBuffer());})).then(value=>{buffers=value;return value;}).catch(error=>{loading=null;throw error;});
    return loading;
  }
  async function applyRequested(){
    const token=++revision;
    // Turning one category off must not stop voices belonging to the other.
    if(!musicRequested){musicEnabled=false;for(const v of [...voices].filter(v=>v.kind==='music'))stopVoice(v);}
    if(!effectsRequested){effectsEnabled=false;for(const v of [...voices].filter(v=>v.kind!=='music'))stopVoice(v);}
    if(!musicRequested&&!effectsRequested){if(master)master.gain.value=0;return false;}
    try{
      const ctx=ensureContext();await ctx.resume();if(token!==revision)return false;
      await load();if(token!==revision)return false;
      master.gain.value=.7;
      if(effectsRequested&&!effectsEnabled){lastBellTime=lastRustleTime=-Infinity;lastActionTime.clear();}
      musicEnabled=musicRequested;effectsEnabled=effectsRequested;
      if(musicEnabled&&![...voices].some(v=>v.kind==='music'))startMusic();
      return musicEnabled||effectsEnabled;
    }catch(error){if(token===revision){musicEnabled=effectsEnabled=false;if(master)master.gain.value=0;for(const v of [...voices])stopVoice(v);}throw error;}
  }
  return {
    async setEnabled(value){musicRequested=effectsRequested=value;return applyRequested();},
    async setMusicEnabled(value){musicRequested=value;await applyRequested();return musicEnabled;},
    async setEffectsEnabled(value){effectsRequested=value;await applyRequested();return effectsEnabled;},
    playMailboxOpen(){return playAction(0,'mailbox');},
    playSnowmanLand(){return playAction(1,'landing');},
    playConfetti(){
      if(!effectsEnabled||!buffers||context.state!=='running')return false;
      if(!confettiBag.length){
        confettiBag=confettiManifest.variants.map((_,i)=>i);
        for(let i=confettiBag.length-1;i>0;i--){const j=Math.min(i,Math.floor(random()*(i+1)));[confettiBag[i],confettiBag[j]]=[confettiBag[j],confettiBag[i]];}
        if(confettiBag.at(-1)===lastConfetti)[confettiBag[0],confettiBag[confettiBag.length-1]]=[confettiBag.at(-1),confettiBag[0]];
      }
      const active=[...voices].filter(v=>v.kind==='confetti');if(active.length>=3)stopVoice(active[0]);
      const index=confettiBag.pop(),source=context.createBufferSource(),gain=context.createGain();
      source.buffer=buffers[4+ACTION_URLS.length+index];gain.gain.value=confettiManifest.playback_gain;source.connect(gain);gain.connect(master);track(source,gain,'confetti');updateDucking();source.start(context.currentTime);lastConfetti=index;return true;
    },
    playBell(){
      if(!effectsEnabled||!buffers||context.state!=='running')return false;
      const time=context.currentTime;if(time-lastBellTime<.08)return false;
      const active=[...voices].filter(v=>v.kind==='bell');if(active.length>=3)stopVoice(active[0]);
      const index=lastVariant<0?(random()<.5?0:1):1-lastVariant;
      const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffers[index];gain.gain.value=.65;source.connect(gain);gain.connect(master);track(source,gain,'bell');updateDucking();source.start(time);
      lastVariant=index;lastBellTime=time;return true;
    },
    playRustle(){
      if(!effectsEnabled||!buffers||context.state!=='running')return false;
      const time=context.currentTime;if(time-lastRustleTime<.45)return false;
      // A fresh movement replaces the old rustle with a short fade, never piling up.
      for(const voice of [...voices].filter(v=>v.kind==='rustle')){
        voice.kind='rustle-ending';voice.gain.gain.setTargetAtTime(0,time,.008);voice.source.stop(time+.03);
      }
      const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffers[2];gain.gain.value=rustleManifest.playback_gain;source.connect(gain);gain.connect(rustleBus);track(source,gain,'rustle');updateDucking();source.start(time);lastRustleTime=time;return true;
    },
    // Generic UI cues reuse the supplied VARCO bell recordings too.
    chime(){return this.playBell();},
    get enabled(){return musicEnabled||effectsEnabled;},
    get musicEnabled(){return musicEnabled;},
    get effectsEnabled(){return effectsEnabled;},
  };
}
