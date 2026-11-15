import assert from 'node:assert/strict';
import test from 'node:test';
import * as T from 'three';
import {createBauble,createBell} from '../src/props.js';
import {createTreeMotion,createHangingOrnament,suspensionHeight} from '../src/tree-motion.js';
function fixture(type='bauble'){
 const tree=new T.Group();tree.position.set(0,.63,0);
 const assembly=new T.Group();assembly.scale.setScalar(.75);assembly.position.set(.3225,-.4125,.1875);tree.add(assembly);
 const motion=createTreeMotion(tree),item={type,x:.30,y:2,z:.65};
 const object=type==='bell'?createBell():createBauble(),hanging=createHangingOrnament(object,item);assembly.add(hanging.anchor);motion.bind(item,hanging.pivot);
 return {tree,assembly,motion,item,object,...hanging};
}
for(const type of ['bauble','bell'])test(`${type}: rotates about the fixed top hook, not its body`,()=>{
 const f=fixture(type);f.tree.updateMatrixWorld(true);
 const center=f.object.getWorldPosition(new T.Vector3()),expected=f.assembly.localToWorld(new T.Vector3(f.item.x,f.item.y,f.item.z));assert.ok(center.distanceTo(expected)<1e-8);
 const hook=new T.Vector3(0,suspensionHeight(type),0).applyMatrix4(f.object.matrixWorld),anchor=f.pivot.getWorldPosition(new T.Vector3());assert.ok(hook.distanceTo(anchor)<1e-8);
 f.pivot.rotation.z=.45;f.tree.updateMatrixWorld(true);
 const movedHook=new T.Vector3(0,suspensionHeight(type),0).applyMatrix4(f.object.matrixWorld);assert.ok(movedHook.distanceTo(anchor)<1e-8);assert.ok(f.object.getWorldPosition(new T.Vector3()).distanceTo(center)>.05);
});
test('addition moves tree and pendulum, keeps tree foot anchored, then settles',()=>{
 const f=fixture();f.motion.excite(f.item);let maxTree=0,maxSwing=0;
 for(let i=0;i<60*12;i++){f.motion.update(1/60);f.tree.updateMatrixWorld(true);maxTree=Math.max(maxTree,Math.hypot(f.tree.rotation.x,f.tree.rotation.z));maxSwing=Math.max(maxSwing,Math.hypot(f.pivot.rotation.x,f.pivot.rotation.z));const foot=f.assembly.localToWorld(new T.Vector3(-.43,.55,-.25));assert.ok(foot.distanceTo(new T.Vector3(0,.63,0))<1e-8);}
 assert.ok(maxTree>.02&&maxTree<.10);assert.ok(maxSwing>.25&&maxSwing<.7);assert.ok(Math.abs(f.pivot.rotation.z)<.001);assert.ok(Math.abs(f.tree.rotation.x)<.001);
});
test('rapid additions stay bounded; rebinding preserves swing; frame rate remains consistent',()=>{
 const a=fixture(),b=fixture();for(const f of [a,b])f.motion.excite(f.item);
 for(let i=0;i<30;i++)a.motion.update(1/30);for(let i=0;i<120;i++)b.motion.update(1/120);
 assert.ok(Math.abs(a.pivot.rotation.z-b.pivot.rotation.z)<.003);
 const angle=a.pivot.rotation.z;a.motion.clearBindings();const replacement=new T.Group();a.anchor.add(replacement);a.motion.bind(a.item,replacement);assert.equal(replacement.rotation.z,angle);
 for(let i=0;i<1000;i++){a.motion.excite(a.item);a.motion.update(1/60);assert.ok(Number.isFinite(replacement.rotation.z)&&Math.abs(replacement.rotation.z)<=.65);assert.ok(Math.abs(a.tree.rotation.x)<=.095);}
 a.motion.reset();assert.equal(replacement.rotation.z,0);assert.equal(a.tree.rotation.x,0);
});
