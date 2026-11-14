import * as T from 'three';

// Procedural winter interior: visible scenery and an HDR lighting/reflection probe.
// Reflection cards are emissive meshes captured by PMREM, not additional direct lights.
export function createWinterEnvironment(renderer){
  const probe=new T.Scene();probe.background=new T.Color(.13,.16,.18);
  const probeRoom=new T.Mesh(new T.BoxGeometry(24,18,24),new T.MeshBasicMaterial({color:new T.Color(.24,.19,.13),side:T.BackSide}));
  probeRoom.position.y=4;probe.add(probeRoom);
  function card(w,h,pos,rgb){const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color(...rgb),side:T.DoubleSide}));o.position.set(...pos);o.lookAt(0,2,0);probe.add(o);return o;}
  card(4,6,[-8,5,4],[3.2,4.0,5.5]);
  card(3,6,[7,4,1],[5.5,3.8,2.0]);
  card(7,3,[0,9,-2],[2.8,2.6,2.0]);
  card(5,4,[-3,4,-9],[1.2,1.8,2.4]);
  // Mullions break the window reflection into believable panes.
  for(const y of [3,5,7]){const bar=new T.Mesh(new T.BoxGeometry(.1,.07,4.3),new T.MeshBasicMaterial({color:'#192326'}));bar.position.set(-7.7,y,4);probe.add(bar);}
  const pmrem=new T.PMREMGenerator(renderer),target=pmrem.fromScene(probe,.025,.1,60);pmrem.dispose();
  probe.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});

  const room=new T.Group();room.name='Winter_Interior_Backdrop';
  const basic=(c)=>new T.MeshBasicMaterial({color:c});
  const wood=new T.MeshStandardMaterial({color:'#493021',roughness:.42,metalness:.08});
  const floor=new T.Mesh(new T.PlaneGeometry(90,90),wood);floor.rotation.x=-Math.PI/2;floor.position.y=-.025;floor.receiveShadow=true;room.add(floor);
  // A fine table grain, generated with geometry rather than an external bitmap.
  const grainMat=basic('#271b13');
  for(let i=0;i<100;i++){const line=new T.Mesh(new T.BoxGeometry(60,.001,.004+(i%4)*.003),grainMat);line.position.set(0,-.023,-18+i*.37);room.add(line);}
  const walls=new T.Mesh(new T.CylinderGeometry(17,17,18,64,1,true),new T.MeshStandardMaterial({color:'#23382f',roughness:1,side:T.BackSide}));walls.position.y=8.7;room.add(walls);
  const trimMat=new T.MeshStandardMaterial({color:'#62513a',roughness:.55,metalness:.2});
  function box(parent,size,pos,material){const m=new T.Mesh(new T.BoxGeometry(...size),material);m.position.set(...pos);parent.add(m);return m;}
  for(let k=0;k<5;k++){
    const a=k/5*Math.PI*2+.35,window=new T.Group();window.position.set(Math.sin(a)*15.8,5.0,Math.cos(a)*15.8);window.lookAt(0,5,0);room.add(window);
    box(window,[4.5,7,.14],[0,0,0],trimMat);
    box(window,[4.2,6.7,.15],[0,0,.08],basic(new T.Color(.16,.28,.45)));
    for(const x of [-2.1,0,2.1])box(window,[.1,6.8,.22],[x,0,.2],trimMat);
    for(const y of [-3.3,-1.1,1.1,3.3])box(window,[4.3,.1,.22],[0,y,.2],trimMat);
    // Deep red drapes frame the cool windows.
    for(const x of [-2.9,2.9])box(window,[1.0,8,.45],[x,.2,.2],new T.MeshStandardMaterial({color:'#482125',roughness:.95}));
  }
  const bulbGeometry=new T.SphereGeometry(.095,12,8),bulbMats=[new T.MeshBasicMaterial({color:new T.Color(5.5,2.7,.7)}),new T.MeshBasicMaterial({color:new T.Color(3.2,1.8,.65)}),new T.MeshBasicMaterial({color:new T.Color(1.3,2.0,3.8)})];
  const wirePts=[];
  for(let i=0;i<=150;i++){const a=i/150*Math.PI*2,y=5.1+.65*Math.cos(a*6);wirePts.push(new T.Vector3(Math.sin(a)*12,y,Math.cos(a)*12));}
  const wire=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(wirePts),180,.018,4,false),basic('#352e1c'));room.add(wire);
  for(let i=0;i<90;i++){const a=i/90*Math.PI*2,y=5.1+.65*Math.cos(a*6);const b=new T.Mesh(bulbGeometry,bulbMats[i%11===0?2:i%2]);b.position.set(Math.sin(a)*12,y-.08,Math.cos(a)*12);room.add(b);}
  // Soft-focus fir silhouettes and lights give depth beyond the tabletop object.
  for(const [x,z,h] of [[-7,-7,6.4],[7,-9,7.2],[-9,7,5.8]]){
    for(let j=0;j<4;j++){const tree=new T.Mesh(new T.ConeGeometry((4-j)*.52,h*.4,20),new T.MeshStandardMaterial({color:'#193b2a',roughness:.9}));tree.position.set(x,h*.24+j*h*.17,z);room.add(tree);}
    for(let j=0;j<28;j++){const a=j*2.4,y=.8+j/28*h*.8,r=(1-y/h)*1.9;const b=new T.Mesh(bulbGeometry,bulbMats[j%2]);b.position.set(x+Math.cos(a)*r,y,z+Math.sin(a)*r);room.add(b);}
  }
  return {room,environment:target.texture};
}
