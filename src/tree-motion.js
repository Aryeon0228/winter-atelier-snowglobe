import * as THREE from 'three';

export const suspensionHeight=type=>type==='bell'?.815:.755;
const clamp=(value,limit)=>Math.max(-limit,Math.min(limit,value));
const spring=()=>({angle:0,velocity:0});
function stepSpring(s,dt,frequency,damping,force=0,limit=.65){
  const acceleration=-frequency*frequency*s.angle-damping*s.velocity+force;
  s.velocity+=acceleration*dt;s.angle+=s.velocity*dt;
  if(Math.abs(s.angle)>limit){s.angle=clamp(s.angle,limit);s.velocity*=.25;}
  return acceleration;
}

// A fixed hook, then a rotating pendulum, then the ornament hanging below it.
export function createHangingOrnament(object,item){
  const scale=item.type==='bell'?.32:.25,hook=suspensionHeight(item.type)*scale;
  const anchor=new THREE.Group();anchor.name='Ornament_Hook';
  anchor.position.set(item.x,item.y+hook,item.z);
  anchor.rotation.y=Math.atan2(item.x+.43,item.z+.25);
  const pivot=new THREE.Group();pivot.name='Ornament_Pendulum';anchor.add(pivot);
  object.scale.setScalar(scale);object.position.set(0,-hook,0);pivot.add(object);
  anchor.userData.ornament=true;
  return {anchor,pivot};
}

export function createTreeMotion(treePivot){
  const treeX=spring(),treeZ=spring(),states=new WeakMap();let ornaments=[];
  return {
    clearBindings(){ornaments=[];},
    bind(item,pivot){let state=states.get(item);if(!state){state={x:spring(),z:spring()};states.set(item,state);}ornaments.push({item,pivot,state});pivot.rotation.set(state.x.angle,0,state.z.angle);},
    excite(item,strength=1){
      const angle=item?Math.atan2(item.x+.43,item.z+.25):.65;
      treeX.velocity=clamp(treeX.velocity+Math.cos(angle)*.32*strength,.65);
      treeZ.velocity=clamp(treeZ.velocity-Math.sin(angle)*.32*strength,.65);
      for(const entry of ornaments){
        const local=angle-entry.pivot.parent.rotation.y;
        const impulse=(entry.item===item?3.8:.38)*strength;
        entry.state.x.velocity=clamp(entry.state.x.velocity+(entry.item===item?.16:Math.cos(local))*impulse,5);
        entry.state.z.velocity=clamp(entry.state.z.velocity+(entry.item===item?1:Math.sin(local)+.30)*impulse,5);
      }
    },
    update(delta){
      const duration=Math.min(Math.max(delta,0),.1),steps=Math.max(1,Math.ceil(duration*120)),dt=duration/steps;
      for(let i=0;i<steps;i++){
        const ax=stepSpring(treeX,dt,5.6,3.2,0,.095),az=stepSpring(treeZ,dt,5.6,3.2,0,.095);
        for(const {item,pivot,state} of ornaments){
          const yaw=pivot.parent.rotation.y,c=Math.cos(yaw),s=Math.sin(yaw),frequency=item.type==='bell'?8.1:9.2;
          // Parent acceleration makes the hanging ornaments lag behind the tree.
          const lever=.55+Math.max(0,item.y-.55)*.32;
          stepSpring(state.x,dt,frequency,2.0,-(ax*c-az*s)*lever);
          stepSpring(state.z,dt,frequency,2.0,-(ax*s+az*c)*lever);
        }
      }
      treePivot.rotation.x=treeX.angle;treePivot.rotation.z=treeZ.angle;
      for(const {pivot,state} of ornaments){pivot.rotation.x=state.x.angle;pivot.rotation.z=state.z.angle;}
    },
    reset(){treeX.angle=treeX.velocity=treeZ.angle=treeZ.velocity=0;treePivot.rotation.set(0,0,0);for(const {pivot,state} of ornaments){state.x.angle=state.x.velocity=state.z.angle=state.z.velocity=0;pivot.rotation.set(0,0,0);}},
  };
}
