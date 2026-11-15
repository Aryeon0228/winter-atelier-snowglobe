import * as T from 'three';
const CAPACITY=360,PER_BURST=40;
const colors=['#fff6d8','#e8b957','#bc4263','#79c8ae','#fafaff'];
// Fixed instance pool: nine simultaneous presents need only one draw call.
export function createGiftConfetti(parent,random=Math.random){
  const group=new T.Group();group.name='Gift_Confetti';parent.add(group);
  const material=new T.MeshBasicMaterial({color:'#fff',side:T.DoubleSide,toneMapped:false});
  const mesh=new T.InstancedMesh(new T.PlaneGeometry(1,1),material,CAPACITY);mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.frustumCulled=false;group.add(mesh);
  const particles=Array(CAPACITY).fill(null),dummy=new T.Object3D(),origin=new T.Vector3();let cursor=0,liveCount=0;
  dummy.scale.setScalar(0);dummy.updateMatrix();for(let i=0;i<CAPACITY;i++){mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,new T.Color(colors[i%colors.length]));}
  mesh.visible=false;
  function draw(){
    let active=0;
    for(let i=0;i<CAPACITY;i++){
      const p=particles[i];
      if(!p||p.age>=p.life){particles[i]=null;dummy.scale.setScalar(0);}
      else{
        active++;const t=p.age,spread=(1-Math.exp(-1.7*t))/1.7;
        dummy.position.set(p.x+p.vx*spread+Math.sin(t*6+p.phase)*.018*t,p.y+p.vy*(1-Math.exp(-1.3*t))/1.3-.72*t*t,p.z+p.vz*spread);
        // Keep the little celebration inside the glass and above the snow.
        dummy.position.y=Math.max(.66,dummy.position.y);
        const maxR=Math.sqrt(Math.max(0,2.4**2-(dummy.position.y-2.35)**2))-.035;
        const r=Math.hypot(dummy.position.x,dummy.position.z);
        if(r>maxR){dummy.position.x*=maxR/r;dummy.position.z*=maxR/r;}
        const fade=Math.min(1,(p.life-t)/.45),size=p.size*Math.max(0,fade);
        dummy.rotation.set(p.phase+t*p.spin,t*p.spin*.7,p.phase-t*p.spin*.8);dummy.scale.set(size,size*p.aspect,size);
      }
      dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate=true;mesh.visible=active>0;liveCount=active;return active;
  }
  return {group,mesh,
    burst(gift,age=0){
      gift.updateWorldMatrix(true,false);parent.updateWorldMatrix(true,false);
      origin.set(0,.73,0);gift.localToWorld(origin);parent.worldToLocal(origin);
      for(let i=0;i<PER_BURST;i++){
        const angle=random()*Math.PI*2,speed=.65+random()*.85;
        particles[cursor]={age,life:2.05+random()*.45,x:origin.x,y:origin.y,z:origin.z,vx:Math.cos(angle)*speed,vz:Math.sin(angle)*speed,vy:1.9+random()*1.1,size:.035+random()*.035,aspect:.55+random()*.7,spin:4+random()*8,phase:random()*Math.PI*2};cursor=(cursor+1)%CAPACITY;
      }
      draw();
    },
    update(dt){if(!liveCount)return;for(const p of particles)if(p)p.age+=Math.max(0,dt);draw();},
    clear(){particles.fill(null);draw();},
    get count(){return particles.filter(p=>p&&p.age<p.life).length;},
  };
}
