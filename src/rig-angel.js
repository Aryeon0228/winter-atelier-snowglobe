import * as T from 'three';

// A lightweight, character-specific 17-bone rig for this static VARCO mesh.
// Weights are assigned in the source mesh's normalized coordinates (height ≈ 1).
export function rigAngel(source){
  source.updateMatrixWorld(true);
  const group=new T.Group();group.name='Seated_Angel_Rig';const bones=[],byName={};
  function bone(name,parent,position){const b=new T.Bone();b.name=name;const world=new T.Vector3(...position);b.position.copy(world);if(parent){b.position.sub(parent.userData.rest);parent.add(b);}b.userData.rest=world;bones.push(b);byName[name]=b;return b;}
  const pelvis=bone('Angel_Hips',null,[0,.32,0]);
  const spine=bone('Angel_Spine',pelvis,[0,.43,0]),chest=bone('Angel_Chest',spine,[0,.53,0]),neck=bone('Angel_Neck',chest,[0,.59,0]),head=bone('Angel_Head',neck,[0,.70,0]);
  for(const [side,sign] of [['Left',-1],['Right',1]]){
    const arm=bone('Angel_'+side+'Arm',chest,[sign*.14,.535,0]);
    const fore=bone('Angel_'+side+'ForeArm',arm,[sign*.245,.535,.015]);
    bone('Angel_'+side+'Hand',fore,[sign*.325,.54,.025]);
    const thigh=bone('Angel_'+side+'Thigh',pelvis,[sign*.052,.29,0]);
    const shin=bone('Angel_'+side+'Shin',thigh,[sign*.052,.125,0]);
    bone('Angel_'+side+'Foot',shin,[sign*.052,.045,.01]);
  }
  group.add(pelvis);group.updateMatrixWorld(true);const skeleton=new T.Skeleton(bones);skeleton.calculateInverses();
  const index=name=>bones.indexOf(byName[name]),smooth=(a,b,x)=>T.MathUtils.smoothstep(x,a,b);
  const meshes=[];source.traverse(o=>{if(o.isMesh)meshes.push(o);});
  for(const original of meshes){
    const geometry=original.geometry.clone().applyMatrix4(original.matrixWorld),pos=geometry.getAttribute('position'),indices=[],weights=[];
    for(let i=0;i<pos.count;i++){
      const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),ax=Math.abs(x),side=x<0?'Left':'Right';let a,b,w=0;
      const wing=z<-.105 && y>.32 && y<.58 && ax>.10;
      if(y>.585 || (y>.565 && ax<.205 && z>.075)){a='Head';b='Head';}
      else if(wing){a='Chest';b='Chest';}
      else if(ax>.145 && y>.47 && y<.585){
        if(ax>.30){a=side+'ForeArm';b=side+'Hand';w=smooth(.303,.342,ax);}
        else if(ax>.215){a=side+'Arm';b=side+'ForeArm';w=smooth(.215,.265,ax);}
        else {a='Chest';b=side+'Arm';w=smooth(.145,.18,ax);}
      }
      else if(y<.265 && ax<.113 && (y<.11||Math.abs(z)<.09)){
        if(y<.10){a=side+'Foot';b=side+'Foot';w=0;}
        else {a=side+'Thigh';b=side+'Shin';w=1-smooth(.10,.15,y);}
      }
      else if(y<.40){a='Hips';b='Spine';w=smooth(.33,.43,y);}
      else if(y<.51){a='Spine';b='Chest';w=smooth(.43,.51,y);}
      else {a='Chest';b='Head';w=smooth(.55,.59,y);}
      indices.push(w<1?index('Angel_'+a):0,w>0?index('Angel_'+b):0,0,0);weights.push(1-w,w,0,0);
    }
    geometry.setAttribute('skinIndex',new T.Uint16BufferAttribute(indices,4));geometry.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));
    // Spread the dress across the seated thighs, preserving the original texture.
    for(let i=0;i<pos.count;i++){const y=pos.getY(i);if(y>.18&&y<.40&&(y>.265||Math.hypot(pos.getX(i),pos.getZ(i))>.115)){const t=1-smooth(.20,.40,y),z=pos.getZ(i);pos.setXYZ(i,pos.getX(i)*(1+.22*t),y+.045*(1-smooth(.20,.34,y))+Math.max(0,z)*.18*t,z*(z>0?1+.20*t:1+.20*t));}}
    pos.needsUpdate=true;geometry.computeVertexNormals();
    const skinned=new T.SkinnedMesh(geometry,original.material);skinned.name='Angel_SkinnedMesh';skinned.castShadow=true;skinned.receiveShadow=true;group.add(skinned);skinned.bind(skeleton,new T.Matrix4());skinned.frustumCulled=false;
  }
  function seat(){
    pelvis.position.y=.10;
    for(const side of ['Left','Right']){byName['Angel_'+side+'Thigh'].rotation.x=-1.45;byName['Angel_'+side+'Shin'].rotation.x=.25;byName['Angel_'+side+'Foot'].rotation.x=1.2;}
    byName.Angel_LeftArm.rotation.set(0,0,0);byName.Angel_LeftForeArm.rotation.z=1.15;
    byName.Angel_RightArm.rotation.z=-.15;byName.Angel_RightForeArm.rotation.z=1.55;byName.Angel_RightHand.rotation.y=-.2;
    group.updateMatrixWorld(true);skeleton.update();
  }
  const times=[0,.5,.85,1.2,1.55,1.9,2.25,2.6,3.1,6],angles=[-.12,-.12,.25,-.25,.25,-.25,.25,-.12,-.12,-.12];
  const values=[];for(const a of angles){const q=new T.Quaternion().setFromEuler(new T.Euler(0,-.2,a));values.push(...q.toArray());}
  const wave=new T.AnimationClip('Seated_Gentle_Wave',6,[new T.QuaternionKeyframeTrack('Angel_RightHand.quaternion',times,values)]);
  group.animations=[wave];return {group,seat,clip:wave,bones:byName};
}
