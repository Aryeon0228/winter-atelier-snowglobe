import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createSceneAudio,BELL_URLS} from '../src/scene-audio.js';
import {createBauble,createBell} from '../src/props.js';
import {createHangingOrnament} from '../src/tree-motion.js';
import {findOrnamentHit} from '../src/ornament-picking.js';
function fixture(fetcher){
 const sources=[],context={currentTime:0,state:'suspended',destination:{},resumeCalls:0,
  async resume(){this.resumeCalls++;this.state='running';},
  async decodeAudioData(data){return {id:new Uint8Array(data)[0]};},
  createGain(){return {gain:{value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};},
  createBufferSource(){const source={buffer:null,connect(){},disconnect(){},start(t){this.started=t;},stop(){this.stopped=true;this.onended?.();}};sources.push(source);return source;},
  createOscillator(){const source=this.createBufferSource();source.frequency={value:0};return source;}
 };
 let fetchCount=0;
 const fetchAudio=fetcher|| (async url=>({ok:true,arrayBuffer:async()=>Uint8Array.of(BELL_URLS.indexOf(url)).buffer}));
 const audio=createSceneAudio({contextFactory:()=>context,fetcher:(...args)=>{fetchCount++;return fetchAudio(...args);},random:()=>.1});
 return {audio,context,sources,get fetchCount(){return fetchCount;}};
}
test('real bell variants alternate without immediate repeats; mute stops voices and cached audio is reused',async()=>{
 const f=fixture();assert.equal(f.audio.playBell(),false);assert.equal(f.fetchCount,0);assert.equal(await f.audio.setEnabled(true),true);assert.equal(f.fetchCount,2);
 for(let i=0;i<6;i++){f.context.currentTime=i*.2;assert.equal(f.audio.playBell(),true);assert.equal(f.sources.at(-1).buffer.id,i%2);assert.equal(f.audio.playBell(),false,'rapid clicks are throttled without advancing variation');}
 assert.ok(f.sources.filter(s=>!s.stopped).length<=3);await f.audio.setEnabled(false);assert.ok(f.sources.every(s=>s.stopped));assert.equal(f.audio.playBell(),false);await f.audio.setEnabled(true);assert.equal(f.fetchCount,2);assert.equal(f.audio.playBell(),true);assert.equal(f.sources.at(-1).buffer.id,0);
});
test('muting during loading prevents late playback, and failed downloads can be retried',async()=>{
 const pending=[];const f=fixture(()=>new Promise(resolve=>pending.push(resolve)));const enabling=f.audio.setEnabled(true);await Promise.resolve();assert.equal(pending.length,2);await f.audio.setEnabled(false);pending.forEach((resolve,i)=>resolve({ok:true,arrayBuffer:async()=>Uint8Array.of(i).buffer}));assert.equal(await enabling,false);assert.equal(f.audio.enabled,false);assert.equal(f.audio.playBell(),false);assert.equal(f.sources.length,0);
 let fail=true;const g=fixture(async()=>({ok:!fail,arrayBuffer:async()=>Uint8Array.of(0).buffer}));await assert.rejects(g.audio.setEnabled(true));assert.equal(g.audio.enabled,false);fail=false;assert.equal(await g.audio.setEnabled(true),true);
});
for(const type of ['bauble','bell'])test(`ray hits a nested ${type} mesh and resolves its existing hook without adding an ornament`,()=>{
 const root=new T.Group(),items=new WeakMap(),item={type,x:0,y:0,z:0},object=type==='bell'?createBell():createBauble(),{anchor}=createHangingOrnament(object,item);root.add(anchor);items.set(anchor,item);root.updateMatrixWorld(true);
 const ray=new T.Raycaster(new T.Vector3(0,type==='bell'?.10:0,3),new T.Vector3(0,0,-1));const hit=ray.intersectObject(root,true)[0];assert.ok(hit);const resolved=findOrnamentHit(hit.object,items);assert.equal(resolved.anchor,anchor);assert.equal(resolved.item,item);assert.equal(root.children.length,1);assert.equal(findOrnamentHit(new T.Group(),items),null);
});
