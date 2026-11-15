import * as T from 'three';
const CAPACITY=128;
export function createSnowmanPowder(parent,random=Math.random){
  const positions=new Float32Array(CAPACITY*3),sizes=new Float32Array(CAPACITY),alphas=new Float32Array(CAPACITY),particles=Array(CAPACITY).fill(null);
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(positions,3).setUsage(T.DynamicDrawUsage));geometry.setAttribute('puffSize',new T.BufferAttribute(sizes,1).setUsage(T.DynamicDrawUsage));geometry.setAttribute('puffAlpha',new T.BufferAttribute(alphas,1).setUsage(T.DynamicDrawUsage));
  const material=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{viewportHeight:{value:800}},vertexShader:`
    uniform float viewportHeight;attribute float puffSize;attribute float puffAlpha;varying float alpha;
    void main(){alpha=puffAlpha;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=clamp(puffSize*viewportHeight*projectionMatrix[1][1]/max(.1,-mv.z),1.0,28.0);gl_Position=projectionMatrix*mv;}
  `,fragmentShader:`
    varying float alpha;
    void main(){float r=length(gl_PointCoord-.5);float a=(1.0-smoothstep(.16,.5,r))*alpha;if(a<.01)discard;gl_FragColor=vec4(vec3(1.65,1.70,1.75),a);}
  `});
  const points=new T.Points(geometry,material);points.name='Snowman_Powder';points.frustumCulled=false;points.visible=false;parent.add(points);
  const origin=new T.Vector3();let cursor=0,liveCount=0;
  function draw(){
    liveCount=0;
    for(let i=0;i<CAPACITY;i++){
      const p=particles[i];if(!p||p.age>=p.life){particles[i]=null;alphas[i]=0;sizes[i]=0;continue;}
      liveCount++;const t=p.age,travel=(1-Math.exp(-2*t))/2;
      let x=p.x+p.vx*travel,z=p.z+p.vz*travel;const y=Math.max(.655,p.y+p.vy*t-1.65*t*t),maxR=Math.sqrt(Math.max(0,2.4**2-(y-2.35)**2))-.025,r=Math.hypot(x,z);
      if(r>maxR){x*=maxR/r;z*=maxR/r;}
      positions.set([x,y,z],i*3);sizes[i]=p.size*(1+.35*t);alphas[i]=.88*Math.pow(1-t/p.life,1.15);
    }
    geometry.attributes.position.needsUpdate=true;geometry.attributes.puffSize.needsUpdate=true;geometry.attributes.puffAlpha.needsUpdate=true;points.visible=liveCount>0;
  }
  return {points,
    burst(root,kind='takeoff',age=0){
      root.updateWorldMatrix(true,false);parent.updateWorldMatrix(true,false);origin.set(0,0,0);root.localToWorld(origin);parent.worldToLocal(origin);
      const landing=kind==='landing',count=landing?52:44;
      for(let i=0;i<count;i++){
        const a=random()*Math.PI*2,r=.27+random()*.17,speed=(landing?.8:.6)*( .6+random());
        particles[cursor]={age,life:.65+random()*.40,x:origin.x+Math.cos(a)*r,y:Math.max(.66,origin.y+.08)+random()*.025,z:origin.z+Math.sin(a)*r,vx:Math.cos(a)*speed,vz:Math.sin(a)*speed,vy:(landing?.65:.9)+random()*.6,size:.022+random()*.040};cursor=(cursor+1)%CAPACITY;
      }
      draw();
    },
    update(dt){if(!liveCount)return;for(const p of particles)if(p)p.age+=Math.max(0,dt);draw();},
    resize(height,pixelRatio=1){material.uniforms.viewportHeight.value=height*pixelRatio;},
    clear(){particles.fill(null);draw();},
    get count(){return liveCount;},
  };
}
