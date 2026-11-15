import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createGift,palettes} from '../src/props.js';
import {applyGiftPose,createGiftMotion,GIFT_DURATION} from '../src/gift-motion.js';
import {createGiftConfetti} from '../src/gift-confetti.js';
import {giftLayout,giftScales} from '../src/scene-layout.js';

test('lid and bow lift together above a hollow box, then close exactly without moving the base',()=>{
 const gift=createGift(),lid=gift.getObjectByName('Gift_Lid'),body=gift.getObjectByName('Gift_Body'),bow=gift.getObjectByName('Gift_Bow');
 assert.equal(bow.parent,lid);const boxPose=body.position.clone();
 applyGiftPose(gift,.62);gift.updateMatrixWorld(true);assert.ok(lid.position.y>1.7);assert.deepEqual(body.position,boxPose);
 const ray=new T.Raycaster(new T.Vector3(.20,.70,.18),new T.Vector3(0,-1,0));
 const hit=ray.intersectObject(body,true)[0];assert.ok(hit);assert.ok(hit.point.y<=.101,'opening must expose floor, not a solid top or ribbon');
 const copy=gift.clone(true);applyGiftPose(copy);assert.equal(copy.getObjectByName('Gift_Lid').position.y,.76);assert.ok(lid.position.y>1.7,'export reset must not modify live pose');
 applyGiftPose(gift,GIFT_DURATION);assert.deepEqual(lid.position.toArray(),[0,.76,0]);assert.deepEqual(lid.rotation.toArray(),[0,0,0,'XYZ']);
});

test('gifts open independently, emit once after lifting, survive palette rebind and accept replay after closing',()=>{
 const a=createGift(),b=createGift(),bursts=[];const motion=createGiftMotion((root,age)=>bursts.push({root,age}));
 motion.bind('a',a);motion.bind('b',b);assert.equal(motion.open('a'),true);assert.equal(motion.open('a'),false);
 motion.update(.20);assert.equal(bursts.length,0);assert.equal(b.getObjectByName('Gift_Lid').position.y,.76);
 assert.equal(motion.open('b'),true);motion.update(.16);assert.equal(bursts.length,1);assert.equal(bursts[0].root,a);assert.ok(a.getObjectByName('Gift_Lid').position.y>1.1);
 const replacement=createGift(palettes.snow),pose=a.getObjectByName('Gift_Lid').position.y;motion.bind('a',replacement);assert.equal(replacement.getObjectByName('Gift_Lid').position.y,pose);
 motion.update(.4);assert.equal(bursts.length,2);motion.update(3);assert.equal(replacement.getObjectByName('Gift_Lid').position.y,.76);assert.equal(b.getObjectByName('Gift_Lid').position.y,.76);assert.equal(bursts.length,2);
 assert.equal(motion.open('a'),true);motion.update(.5);assert.equal(bursts.length,3);motion.reset();assert.equal(replacement.getObjectByName('Gift_Lid').position.y,.76);
});

test('gift timing is consistent at 30 and 120 fps',()=>{
 const results=[];for(const fps of [30,120]){const root=createGift();let count=0;const motion=createGiftMotion(()=>count++);motion.bind('a',root);motion.open('a');for(let i=0;i<fps;i++)motion.update(1/fps);results.push({y:root.getObjectByName('Gift_Lid').position.y,count});}
 assert.ok(Math.abs(results[0].y-results[1].y)<1e-9);assert.equal(results[0].count,1);assert.equal(results[1].count,1);
});

test('nine confetti bursts stay inside the dome, use a bounded pool and expire completely',()=>{
 const parent=new T.Group();parent.rotation.z=.1;const confetti=createGiftConfetti(parent,()=>.47);
 giftLayout.forEach(([x,z,yaw],i)=>{const gift=createGift();gift.position.set(x,.625,z);gift.rotation.y=yaw;gift.scale.setScalar(giftScales[i%3]);parent.add(gift);confetti.burst(gift);});
 assert.equal(confetti.count,360);assert.equal(confetti.mesh.count,360);
 const matrix=new T.Matrix4(),p=new T.Vector3(),q=new T.Quaternion(),scale=new T.Vector3();
 for(let f=0;f<180;f++){
  confetti.update(1/60);
  for(let i=0;i<360;i++){confetti.mesh.getMatrixAt(i,matrix);matrix.decompose(p,q,scale);assert.ok(matrix.elements.every(Number.isFinite));if(scale.x>1e-8){assert.ok(p.y>=.6599);assert.ok(Math.hypot(p.x,p.y-2.35,p.z)<=2.401);}}
 }
 assert.equal(confetti.count,0);assert.equal(confetti.mesh.visible,false);
 const gift=parent.children.find(o=>o.userData.interaction==='gift');confetti.burst(gift);assert.equal(confetti.count,40);confetti.clear();assert.equal(confetti.count,0);
});
