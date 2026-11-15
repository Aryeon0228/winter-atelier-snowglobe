import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createSceneAudio,BELL_URLS,AUDIO_URLS} from '../src/scene-audio.js';
import {createSnowmanMotion} from '../src/snowman-motion.js';
import {createBauble,createBell,createSnowman} from '../src/props.js';
import {createHangingOrnament} from '../src/tree-motion.js';
import {findOrnamentHit} from '../src/ornament-picking.js';
function fixture(fetcher){
 const sources=[],context={currentTime:0,state:'suspended',destination:{},resumeCalls:0,
  async resume(){this.resumeCalls++;this.state='running';},
  async decodeAudioData(data){return {id:new Uint8Array(data)[0]};},
  createGain(){return {gain:{value:0,targets:[],setTargetAtTime(value,time,constant){this.value=value;this.targets.push({value,time,constant});},setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(target){this.output=target;},disconnect(){}};},
  createBufferSource(){const source={buffer:null,connect(target){this.output=target;},disconnect(){},start(t){this.started=t;},stop(){this.stopped=true;this.onended?.();}};sources.push(source);return source;},
  createOscillator(){const source=this.createBufferSource();source.frequency={value:0};return source;}
 };
 let fetchCount=0;
 const fetchAudio=fetcher|| (async url=>({ok:true,arrayBuffer:async()=>Uint8Array.of(AUDIO_URLS.indexOf(url)).buffer}));
 const audio=createSceneAudio({contextFactory:()=>context,fetcher:(...args)=>{fetchCount++;return fetchAudio(...args);},random:()=>.1});
 return {audio,context,sources,get fetchCount(){return fetchCount;}};
}
test('real bell variants alternate without immediate repeats; mute stops voices and cached audio is reused',async()=>{
 const f=fixture();assert.equal(f.audio.playBell(),false);assert.equal(f.fetchCount,0);assert.equal(await f.audio.setEnabled(true),true);assert.equal(f.fetchCount,6);
 for(let i=0;i<6;i++){f.context.currentTime=i*.2;assert.equal(f.audio.playBell(),true);assert.equal(f.sources.at(-1).buffer.id,i%2);assert.equal(f.audio.playBell(),false,'rapid clicks are throttled without advancing variation');}
 assert.ok(f.sources.filter(s=>!s.stopped&&s.buffer.id<2).length<=3);await f.audio.setEnabled(false);assert.ok(f.sources.every(s=>s.stopped));assert.equal(f.audio.playBell(),false);await f.audio.setEnabled(true);assert.equal(f.fetchCount,6);assert.equal(f.audio.playBell(),true);assert.equal(f.sources.at(-1).buffer.id,0);
});
test('muting during loading prevents late playback, and failed downloads can be retried',async()=>{
 const pending=[];const f=fixture(()=>new Promise(resolve=>pending.push(resolve)));const enabling=f.audio.setEnabled(true);await Promise.resolve();assert.equal(pending.length,6);await f.audio.setEnabled(false);pending.forEach((resolve,i)=>resolve({ok:true,arrayBuffer:async()=>Uint8Array.of(i).buffer}));assert.equal(await enabling,false);assert.equal(f.audio.enabled,false);assert.equal(f.audio.playBell(),false);assert.equal(f.sources.length,0);
 let fail=true;const g=fixture(async()=>({ok:!fail,arrayBuffer:async()=>Uint8Array.of(0).buffer}));await assert.rejects(g.audio.setEnabled(true));assert.equal(g.audio.enabled,false);fail=false;assert.equal(await g.audio.setEnabled(true),true);
});
for(const type of ['bauble','bell'])test(`ray hits a nested ${type} mesh and resolves its existing hook without adding an ornament`,()=>{
 const root=new T.Group(),items=new WeakMap(),item={type,x:0,y:0,z:0},object=type==='bell'?createBell():createBauble(),{anchor}=createHangingOrnament(object,item);root.add(anchor);items.set(anchor,item);root.updateMatrixWorld(true);
 const ray=new T.Raycaster(new T.Vector3(0,type==='bell'?.10:0,3),new T.Vector3(0,0,-1));const hit=ray.intersectObject(root,true)[0];assert.ok(hit);const resolved=findOrnamentHit(hit.object,items);assert.equal(resolved.anchor,anchor);assert.equal(resolved.item,item);assert.equal(root.children.length,1);assert.equal(findOrnamentHit(new T.Group(),items),null);
});

test('rustle stays quieter, ducks under every bell voice, recovers smoothly and cannot stack on rapid clicks',async()=>{
 const f=fixture();assert.equal(f.audio.playRustle(),false);await f.audio.setEnabled(true);assert.equal(f.audio.playRustle(),true);
 const first=f.sources.at(-1),bus=first.output.output;assert.equal(first.buffer.id,2);assert.equal(first.output.gain.value,.55);assert.equal(bus.gain.value,1);
 f.audio.playBell();const bellA=f.sources.at(-1);assert.equal(bellA.output.gain.value,.65);assert.equal(bus.gain.value,.55);
 f.context.currentTime=.2;f.audio.playBell();const bellB=f.sources.at(-1);bellA.onended();assert.equal(bus.gain.value,.55,'one remaining bell still protects the ring');assert.equal(f.audio.playRustle(),false);
 f.context.currentTime=.5;assert.equal(f.audio.playRustle(),true);assert.equal(first.stopped,true);const second=f.sources.at(-1);assert.equal(second.buffer.id,2);assert.equal(bus.gain.value,.55);assert.equal(f.audio.playRustle(),false);
 bellB.onended();assert.equal(bus.gain.value,1);assert.equal(bus.gain.targets.at(-1).constant,.16);
 f.context.currentTime=.7;f.audio.playBell();assert.equal(bus.gain.value,.55);assert.equal(second.output.gain.value,.55,'ducking changes only the background bus, not the clip gain');
 await f.audio.setEnabled(false);assert.equal(second.stopped,true);assert.equal(f.audio.playRustle(),false);
});

test('music starts only after enabling, loops quietly once, ducks for bells and stops with mute',async()=>{
 const f=fixture();assert.equal(f.sources.length,0);await f.audio.setEnabled(true);
 const music=f.sources[0],bus=music.output.output;assert.equal(music.buffer.id,3);assert.equal(music.loop,true);assert.equal(music.loopEnd,42);assert.equal(music.output.gain.value,.16);assert.equal(bus.gain.value,1);
 f.audio.playBell();const bell=f.sources.at(-1);assert.equal(bus.gain.value,.7);assert.equal(bell.output.gain.value,.65);bell.onended();assert.equal(bus.gain.value,1);
 await f.audio.setEnabled(true);assert.equal(music.stopped,true);assert.equal(f.sources.filter(s=>s.buffer.id===3&&!s.stopped).length,1);
 await f.audio.setEnabled(false);assert.equal(f.sources.filter(s=>s.buffer.id===3&&!s.stopped).length,0);
 await f.audio.setEnabled(true);assert.equal(f.fetchCount,6);assert.equal(f.sources.at(-1).buffer.id,3);
});

test('mailbox and landing clips play once, duck music until all effects finish and respect mute',async()=>{
 const f=fixture();assert.equal(f.audio.playMailboxOpen(),false);assert.equal(f.audio.playSnowmanLand(),false);await f.audio.setEnabled(true);
 const bus=f.sources[0].output.output;assert.equal(f.audio.playMailboxOpen(),true);const mailbox=f.sources.at(-1);assert.equal(mailbox.buffer.id,4);assert.equal(bus.gain.value,.7);assert.equal(f.audio.playMailboxOpen(),false);
 assert.equal(f.audio.playSnowmanLand(),true);const landing=f.sources.at(-1);assert.equal(landing.buffer.id,5);assert.equal(landing.output.gain.value,.6);mailbox.onended();assert.equal(bus.gain.value,.7);landing.onended();assert.equal(bus.gain.value,1);
 f.context.currentTime=1;f.audio.playMailboxOpen();const old=f.sources.at(-1);f.context.currentTime=2;f.audio.playMailboxOpen();assert.equal(old.stopped,true);
 await f.audio.setEnabled(false);assert.equal(f.sources.at(-1).stopped,true);assert.equal(f.audio.playSnowmanLand(),false);
});
test('landing cue follows the animation ground-contact event, never takeoff or repeated clicks',async()=>{
 const f=fixture();await f.audio.setEnabled(true);const motion=createSnowmanMotion((root,kind)=>{if(kind==='landing')f.audio.playSnowmanLand();});motion.bind(createSnowman());motion.jump();motion.update(.2);assert.equal(f.sources.length,1);assert.equal(motion.jump(),false);motion.update(.63);assert.equal(f.sources.length,1);motion.update(.02);assert.equal(f.sources.at(-1).buffer.id,5);motion.update(3);assert.equal(f.sources.length,2);
});

test('generic UI and gift cue uses supplied VARCO recordings and obeys mute/retrigger rules',async()=>{
 const f=fixture();f.context.createOscillator=()=>{throw Error('Synthesized audio must not be used');};
 assert.equal(f.audio.chime(),false);await f.audio.setEnabled(true);assert.equal(f.audio.chime(),true);assert.equal(f.sources.at(-1).buffer.id,0);assert.equal(f.audio.chime(),false);
 f.context.currentTime=.2;assert.equal(f.audio.chime(),true);assert.equal(f.sources.at(-1).buffer.id,1);await f.audio.setEnabled(false);assert.equal(f.audio.chime(),false);
});
