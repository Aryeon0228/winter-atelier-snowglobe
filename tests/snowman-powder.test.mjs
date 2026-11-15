import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createSnowman} from '../src/props.js';
import {createSnowmanMotion} from '../src/snowman-motion.js';
import {createSnowmanPowder} from '../src/snowman-powder.js';

test('snow powder fires exactly at takeoff and landing, survives rebind, and ignores mid-jump clicks',()=>{
 const root=createSnowman(),events=[],motion=createSnowmanMotion((root,kind,age)=>events.push({root,kind,age}));motion.bind(root);motion.jump();motion.update(.13);assert.equal(events.length,0);motion.update(.02);assert.equal(events[0].kind,'takeoff');assert.ok(Math.abs(events[0].age-.01)<1e-9);assert.equal(motion.jump(),false);
 const replacement=createSnowman();motion.bind(replacement);motion.update(.7);assert.equal(events.length,2);assert.equal(events[1].kind,'landing');assert.equal(events[1].root,replacement);motion.update(3);assert.equal(events.length,2);motion.jump();motion.update(2);assert.equal(events.length,4);
});

test('powder emits around the grounded feet, stays finite and inside glass, and fully fades',()=>{
 const parent=new T.Group(),root=createSnowman();root.position.set(-1.05,.565,.85);parent.rotation.z=.05;parent.add(root);
 let seed=17;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);const powder=createSnowmanPowder(parent,random);
 powder.resize(600,1.5);assert.equal(powder.points.material.uniforms.viewportHeight.value,900);powder.burst(root);assert.equal(powder.count,44);
 const geometry=powder.points.geometry,position=geometry.attributes.position,alpha=geometry.attributes.puffAlpha;
 for(let i=0;i<44;i++){const d=Math.hypot(position.getX(i)+1.05,position.getZ(i)-.85);assert.ok(d>=.269&&d<=.441);assert.ok(position.getY(i)>=.659);}
 powder.burst(root,'landing');assert.equal(powder.count,96);
 for(let f=0;f<90;f++){
  powder.update(1/60);
  for(let i=0;i<position.count;i++)if(alpha.getX(i)>0){const x=position.getX(i),y=position.getY(i),z=position.getZ(i);assert.ok([x,y,z].every(Number.isFinite));assert.ok(y>=.6549);assert.ok(Math.hypot(x,y-2.35,z)<2.401);}
 }
 assert.equal(powder.count,0);assert.equal(powder.points.visible,false);assert.ok(alpha.array.every(a=>a===0));powder.burst(root);powder.clear();assert.equal(powder.count,0);
});
