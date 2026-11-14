import * as T from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const palettes={classic:{name:'클래식 크리스마스',red:'#922f46',cream:'#fff0d1',green:'#23533f',gold:'#d9ae55'},snow:{name:'눈빛과 샴페인',red:'#d3e5e2',cream:'#fffaf0',green:'#4a7371',gold:'#d7bd86'},rose:{name:'로즈와 코코아',red:'#bc6b7a',cream:'#ffe8d6',green:'#66534c',gold:'#c59b68'}};
export const mat=(color,metalness=0,roughness=.38)=>new T.MeshStandardMaterial({color,metalness,roughness});
const mesh=(g,m,parent,p=[0,0,0])=>{const o=new T.Mesh(g,m);o.position.set(...p);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;};
export function starShape(radius=.5){const s=new T.Shape();for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,r=i%2?radius*.46:radius;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?s.lineTo(x,y):s.moveTo(x,y);}s.closePath();return s;}
export function star(radius=.5,depth=.12,color='#d9ae55'){const g=new T.ExtrudeGeometry(starShape(radius),{depth,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:radius*.08,bevelThickness:radius*.06});g.translate(0,0,-depth/2);return new T.Mesh(g,mat(color,.7,.25));}
export function bow(color='#fff0d1',scale=1){const o=new T.Group(),m=mat(color,.08,.33);for(const side of [-1,1]){const loop=mesh(new T.TorusGeometry(.17,.052,8,24),m,o,[side*.16,.05,0]);loop.scale.set(1.25,.8,.55);loop.rotation.z=-side*.3;const tail=mesh(new RoundedBoxGeometry(.1,.26,.035,2,.02),m,o,[side*.09,-.14,-.01]);tail.rotation.z=side*.28;}mesh(new T.SphereGeometry(.09,16,12),m,o).scale.set(1,.8,.65);o.scale.setScalar(scale);return o;}
export function createBauble(p=palettes.classic,index=0){const o=new T.Group();o.name='Bauble';const color=[p.red,p.gold,p.cream][index%3];mesh(new T.SphereGeometry(.5,32,24),mat(color,index%3===1?.65:.13,.25),o);mesh(new T.SphereGeometry(.505,32,8,0,Math.PI*2,Math.PI/2-.13,.26),mat(index%3===2?p.red:p.cream,.1,.35),o);for(const side of [-1,1]){const ring=mesh(new T.TorusGeometry(.5,.008,6,40),mat(p.gold,.7,.25),o,[0,side*.066,0]);ring.rotation.x=Math.PI/2;}mesh(new T.CylinderGeometry(.12,.13,.14,16),mat(p.gold,.75,.23),o,[0,.53,0]);mesh(new T.TorusGeometry(.085,.022,8,20),mat(p.gold,.75,.23),o,[0,.67,0]);const motif=star(.13,.025,p.gold);motif.position.set(0,0,.502);o.add(motif);return o;}
export function createBell(p=palettes.classic){const o=new T.Group();o.name='Bell';const points=[[.34,0],[.39,.025],[.4,.07],[.33,.12],[.28,.32],[.25,.5],[.18,.62],[.06,.66],[0,.67],[0,.59],[.12,.58],[.20,.49],[.23,.31],[.29,.12],[.34,.06],[.34,0]].map(x=>new T.Vector2(...x));mesh(new T.LatheGeometry(points,32),mat(p.gold,.76,.24),o);mesh(new T.SphereGeometry(.09,16,12),mat(p.gold,.65,.23),o,[0,.015,0]);mesh(new T.CylinderGeometry(.018,.018,.25,8),mat(p.gold,.6,.3),o,[0,.18,0]);mesh(new T.TorusGeometry(.085,.025,8,20),mat(p.gold,.7,.25),o,[0,.73,0]);const b=bow(p.green,.75);b.position.set(0,.7,.19);o.add(b);return o;}
export function createGift(p=palettes.classic,index=0){const o=new T.Group();o.name='GiftBox';const colors=[p.red,p.cream,p.green],ribbons=[p.cream,p.green,p.gold];const b=mat(colors[index%3],.04,.42),r=mat(ribbons[index%3],.15,.3);mesh(new RoundedBoxGeometry(.86,.72,.8,3,.05),b,o,[0,.36,0]);mesh(new RoundedBoxGeometry(.91,.12,.85,3,.035),b,o,[0,.76,0]);mesh(new RoundedBoxGeometry(.15,.85,.815,2,.013),r,o,[0,.405,0]);mesh(new RoundedBoxGeometry(.875,.85,.15,2,.013),r,o,[0,.405,0]);const knot=bow(ribbons[index%3],1.1);knot.rotation.x=-Math.PI/2;knot.position.set(0,.86,0);o.add(knot);return o;}
export function createRibbon(p=palettes.classic){const o=new T.Group();o.name='SpiralRibbon';const vertices=[],uv=[],indices=[],segments=240,width=.065;const left=[],right=[];for(let i=0;i<=segments;i++){const t=i/segments,y=1.05+2.98*t,angle=-Math.PI/2+t*Math.PI*6,r=1.03*(1-t)+.23;const x=Math.cos(angle)*r,z=Math.sin(angle)*r;vertices.push(x,y-width,z,x,y+width,z);uv.push(0,t*6,1,t*6);left.push(new T.Vector3(x,y-width,z));right.push(new T.Vector3(x,y+width,z));if(i<segments){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();const m=mat(p.cream,.17,.33);m.side=T.DoubleSide;mesh(g,m,o);for(const points of [left,right])mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),240,.008,5,false),mat(p.gold,.7,.25),o);return o;}
export function createBase(p=palettes.classic){const o=new T.Group();o.name='SnowglobeBase';mesh(new T.CylinderGeometry(2.08,2.18,.3,96),mat(p.red,.12,.36),o,[0,.22,0]);mesh(new T.CylinderGeometry(2.13,2.16,.065,96),mat(p.gold,.75,.25),o,[0,.07,0]);mesh(new T.CylinderGeometry(2.04,2.12,.08,96),mat(p.gold,.72,.25),o,[0,.405,0]);mesh(new T.CylinderGeometry(1.99,2.04,.1,96),mat('#fffef8',0,.96),o,[0,.495,0]);o.add(createSnowdrifts());return o;}
export function createDome(){
  const o=new T.Group();o.name='GlassDome';const radius=2.65,centerY=2.35,theta=Math.acos((.55-centerY)/radius);
  const g=new T.SphereGeometry(radius,96,72,0,Math.PI*2,0,theta);
  const m=new T.MeshPhysicalMaterial({name:'Optical_Glass_IOR_1.5',color:'#ffffff',metalness:0,roughness:.009,transmission:1,thickness:.09,ior:1.5,dispersion:.18,attenuationColor:'#d6eee5',attenuationDistance:5,transparent:false,opacity:1,side:T.FrontSide,depthWrite:false,envMapIntensity:.95});
  const dome=mesh(g,m,o,[0,centerY,0]);dome.castShadow=false;dome.receiveShadow=false;
  // The rolled lip has real rounded geometry, with stronger grazing reflections.
  const lip=mesh(new T.TorusGeometry(Math.sqrt(radius*radius-(.55-centerY)**2),.035,12,96),m,o,[0,.55,0]);lip.rotation.x=Math.PI/2;lip.castShadow=false;lip.receiveShadow=false;
  return o;
}

export function createSnowdrifts(){
  const group=new T.Group();group.name='Soft_Snowdrifts';
  const material=new T.MeshPhysicalMaterial({name:'Powder_Snow',color:'#fffefb',roughness:1,metalness:0,sheen:.7,sheenColor:'#ffffff',sheenRoughness:1});
  const sphere=new T.SphereGeometry(1,40,24);
  const blanket=mesh(sphere,material,group,[0,.535,0]);blanket.scale.set(1.98,.095,1.98);
  for(const [x,z,sx,sy,sz] of [[-1.45,.35,.50,.10,.64],[1.45,.28,.48,.12,.55],[.25,-1.48,.72,.12,.40],[-.95,-1.05,.67,.12,.52],[.55,.95,.54,.055,.57],[-.15,1.54,.54,.07,.32]]){
    const drift=mesh(sphere,material,group,[x,.55,z]);drift.scale.set(sx,sy,sz);
  }return group;
}
