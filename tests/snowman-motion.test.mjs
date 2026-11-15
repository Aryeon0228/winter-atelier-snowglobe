import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createSnowman,palettes} from '../src/props.js';
import {sampleSnowmanJump,applySnowmanPose,createSnowmanMotion,SNOWMAN_JUMP_DURATION} from '../src/snowman-motion.js';
function bounds(root,name){root.updateMatrixWorld(true);return new T.Box3().setFromObject(root.getObjectByName(name));}
test('body jumps; head and hat separate visibly and land in order',()=>{
 const root=createSnowman();applySnowmanPose(root,.5);
 const body=bounds(root,'Snowman_Body'),head=bounds(root,'Snowman_Head'),hat=bounds(root,'Snowman_Pointy_Hat');
 assert.ok(body.min.y>.3);assert.ok(head.min.y>body.max.y+.06);assert.ok(hat.min.y>head.max.y+.1);
 const landing=sampleSnowmanJump(.86);assert.equal(landing.bodyY,0);assert.ok(landing.headGap>.05&&landing.hatGap>.1);
 assert.equal(sampleSnowmanJump(1.08).headGap,0);assert.ok(sampleSnowmanJump(1.08).hatGap>.02);
 for(let t=0;t<=1.6;t+=.005){const p=sampleSnowmanJump(t);assert.ok(Object.values(p).every(Number.isFinite));assert.ok(p.bodyY>=0&&p.bodyScaleY>0&&p.hatY>p.headY);}
});
test('repeated clicks do not restart midair; palette rebind preserves pose; rest and export restore exactly',()=>{
 const root=createSnowman(),motion=createSnowmanMotion();motion.bind(root);assert.equal(motion.jump(),true);motion.update(.5);const before=root.getObjectByName('Snowman_Head').position.y;assert.equal(motion.jump(),false);assert.equal(root.getObjectByName('Snowman_Head').position.y,before);
 const replacement=createSnowman(palettes.rose);motion.bind(replacement);assert.equal(replacement.getObjectByName('Snowman_Head').position.y,before);
 const copy=replacement.clone(true);applySnowmanPose(copy);assert.equal(copy.getObjectByName('Snowman_Body').position.y,0);assert.equal(copy.getObjectByName('Snowman_Head').position.y,.88);assert.equal(copy.getObjectByName('Snowman_Pointy_Hat').position.y,1.075);assert.equal(replacement.getObjectByName('Snowman_Head').position.y,before);
 motion.update(2);assert.equal(motion.active,false);assert.equal(replacement.getObjectByName('Snowman_Head').position.y,.88);assert.equal(motion.jump(),true);
});
test('30 and 120 fps reach the same pose',()=>{
 const a=createSnowman(),b=createSnowman(),ma=createSnowmanMotion(),mb=createSnowmanMotion();ma.bind(a);mb.bind(b);ma.jump();mb.jump();for(let i=0;i<15;i++)ma.update(1/30);for(let i=0;i<60;i++)mb.update(1/120);
 assert.ok(Math.abs(a.getObjectByName('Snowman_Head').position.y-b.getObjectByName('Snowman_Head').position.y)<1e-8);
});
