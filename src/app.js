import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {createWinterEnvironment} from './environment.js';
import {createCameraEffects} from './camera-effects.js';
import {createBauble,createBell,createGift,createRibbon,createBase,createDome,palettes} from './props.js';

const $=s=>document.querySelector(s),stage=$('#stage'),canvas=$('#scene');
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance',preserveDrawingBuffer:true});}catch(e){$('#loading').innerHTML='<strong>3D 화면을 열 수 없어요.</strong><span>WebGL을 지원하는 최신 브라우저에서 다시 열어주세요.</span>';throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.85;
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(37,1,.1,70);camera.position.set(7.2,5.1,10.5);
const controls=new OrbitControls(camera,canvas);controls.target.set(0,2.45,0);controls.enableDamping=true;controls.dampingFactor=.07;controls.minDistance=7;controls.maxDistance=16;controls.maxPolarAngle=Math.PI*.51;controls.minPolarAngle=.25;controls.enablePan=false;controls.autoRotateSpeed=.45;
const winter=createWinterEnvironment(renderer);scene.environment=winter.environment;scene.environmentIntensity=.65;scene.background=new THREE.Color('#1d2924');scene.fog=new THREE.Fog('#1d2924',25,60);scene.add(winter.room);
// One direct spotlight complements the surrounding winter room's image-based lighting.
const key=new THREE.SpotLight('#ffe4bd',180,0,Math.PI/5,.7,2);
key.position.set(-5,8,3);key.target.position.set(0,1.8,0);
key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.near=.5;key.shadow.camera.far=25;key.shadow.bias=-.0002;key.shadow.normalBias=.018;
scene.add(key,key.target);
const world=new THREE.Group();world.name='Winter_Atelier_Snowglobe';scene.add(world);
// Keep the original ornament coordinates inside a uniformly quarter-scale assembly.
const miniature=new THREE.Group();miniature.name='Quarter_Scale_Tree';miniature.scale.setScalar(.25);miniature.position.set(.1075,.4925,.0625);world.add(miniature);
const treeRoot=new THREE.Group();treeRoot.name='VARCO_Tree';treeRoot.position.set(-.43,.55,-.25);miniature.add(treeRoot);
const decor=new THREE.Group(),gifts=new THREE.Group(),scenery=new THREE.Group(),ribbons=new THREE.Group();miniature.add(decor,ribbons);world.add(gifts,scenery);
gifts.name='Nine_Small_Gifts';
let paletteKey='classic',tool='bauble',treeMesh=null,ready=false,muted=true,shakePower=0,globe=null,ribbon=null,base=null;
const initialDecor=[];
for(let tier=0;tier<4;tier++){const y=[1.25,1.97,2.68,3.35][tier],r=[1.05,.84,.61,.38][tier];const count=[5,4,4,3][tier];for(let k=0;k<count;k++){const a=k/count*Math.PI*2+tier*.53;initialDecor.push({type:(k+tier)%4===0?'bell':'bauble',x:-.43+Math.sin(a)*r,y,z:-.25+Math.cos(a)*r,variant:(k+tier)%3});}}
let placements=initialDecor.map(o=>({...o}));
function disposeGroup(group){while(group.children.length){const c=group.children.pop();c.traverse(o=>{o.geometry?.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());});c.parent=null;}}
function createSceneProps(){const p=palettes[paletteKey];disposeGroup(decor);disposeGroup(gifts);disposeGroup(scenery);disposeGroup(ribbons);base=createBase(p);scenery.add(base);ribbon=createRibbon(p);ribbon.position.set(-.43,0,-.25);ribbon.visible=$('#ribbon').checked;ribbons.add(ribbon);globe=createDome();globe.visible=true;scenery.add(globe);
  globe.traverse(o=>{if(o.isMesh){o.material.envMap=winter.environment;o.material.envMapIntensity=.95;}});
  for(let i=0;i<9;i++){const angle=i*Math.PI*2/9+.18,radius=[.48,.61,.54][i%3],scale=[.55,.45,.38][i%3]*.25;
    const gift=createGift(p,i%3);gift.name='Gift_'+(i+1);gift.position.set(Math.sin(angle)*radius,.625,Math.cos(angle)*radius);gift.scale.setScalar(scale);gift.rotation.y=angle+.2*(i%2?1:-1);gifts.add(gift);}
  for(const item of placements){const obj=item.type==='bell'?createBell(p):createBauble(p,item.variant);obj.scale.setScalar(item.type==='bell'?.32:.25);obj.position.set(item.x,item.y,item.z);obj.rotation.y=Math.atan2(item.x+.43,item.z+.25);obj.userData.ornament=true;decor.add(obj);}
  $('#count').textContent=placements.length;$('#palette-name').textContent=p.name;
}
createSceneProps();
function normalizeModel(model,height){model.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());const scale=height/size.y;model.scale.multiplyScalar(scale);model.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(o.material){o.material.roughness=Math.max(o.material.roughness||.5,.55);o.material.metalness=0;}}});return model;}
const loader=new GLTFLoader();
function updateLoad(e){const pct=Math.min(100,Math.round((e.total?e.loaded/e.total:.5)*100));$('#loading-progress').style.width=pct+'%';$('#loading-percent').textContent=pct+'%';}
try{const tree=await loader.loadAsync('assets/tree.glb',updateLoad);treeMesh=normalizeModel(tree.scene,3.85);treeRoot.add(treeMesh);ready=true;document.body.dataset.loaded='true';$('#loading').classList.add('done');$('#status').textContent='겨울을 꾸밀 준비가 되었어요';}
catch(e){$('#loading').innerHTML='<strong>모델을 불러오지 못했어요.</strong><span>연결을 확인하고 새로고침해 주세요.</span><button onclick="location.reload()">다시 열기</button>';console.error(e);}

const snowCount=500,snowPositions=new Float32Array(snowCount*3),snowSpeeds=new Float32Array(snowCount),snowPhases=new Float32Array(snowCount);
function spawnSnow(i,randomHeight=true){const y=randomHeight ? .68+Math.random()*4.15 : 4.45+Math.random()*.3;const maxR=Math.sqrt(Math.max(0,2.5**2-(y-2.35)**2))*.9;const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*maxR;snowPositions[i*3]=Math.cos(a)*r;snowPositions[i*3+1]=y;snowPositions[i*3+2]=Math.sin(a)*r;}
for(let i=0;i<snowCount;i++){spawnSnow(i);snowSpeeds[i]=.13+Math.random()*.18;snowPhases[i]=Math.random()*Math.PI*2;}
const snowGeo=new THREE.BufferGeometry();snowGeo.setAttribute('position',new THREE.BufferAttribute(snowPositions,3));snowGeo.setAttribute('flakePhase',new THREE.BufferAttribute(snowPhases,1));
const snowMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{pixelRatio:{value:renderer.getPixelRatio()},time:{value:0}},vertexShader:`
  uniform float pixelRatio;attribute float flakePhase;varying float phase;
  void main(){phase=flakePhase;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=clamp((72.0+18.0*sin(phase))*pixelRatio/-mv.z,3.0,15.0);gl_Position=projectionMatrix*mv;}`,fragmentShader:`
  uniform float time;varying float phase;
  float segment(vec2 p,vec2 a,vec2 b){vec2 v=b-a;return length(p-a-v*clamp(dot(p-a,v)/dot(v,v),0.0,1.0));}
  void main(){vec2 p=gl_PointCoord-.5;float r=length(p),a=mod(atan(p.y,p.x)+time*.10+phase+0.5235988,1.0471976)-0.5235988;vec2 q=vec2(cos(a),abs(sin(a)))*r;
    float d=segment(q,vec2(0.0),vec2(.44,0.0));d=min(d,segment(q,vec2(.18,0.0),vec2(.29,.11)));d=min(d,segment(q,vec2(.29,0.0),vec2(.38,.08)));
    float alpha=1.0-smoothstep(.009,.028,d);if(alpha<.01)discard;
    float sparkle=pow(max(0.0,sin(time*2.4+phase*7.0)),18.0);gl_FragColor=vec4(vec3(1.9+sparkle*1.6),alpha*.92);
  }`});const snow=new THREE.Points(snowGeo,snowMat);snow.name='Animated_Snow';world.add(snow);
function snowDensity(){snowGeo.setDrawRange(0,Math.round(snowCount*Number($('#snow').value)/100));$('#snow-value').textContent=$('#snow').value+'%';}$('#snow').oninput=snowDensity;snowDensity();
const cameraEffects=createCameraEffects(renderer,scene,camera,()=>[snow]);
function resize(){const {width,height}=stage.getBoundingClientRect();renderer.setSize(width,height,false);cameraEffects.resize(width,height);camera.aspect=width/height;camera.fov=camera.aspect<.8?44:37;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(stage);resize();
$('#post-effects').onchange=()=>cameraEffects.enable($('#post-effects').checked);
$('#bloom').oninput=()=>{cameraEffects.bloom.strength=Number($('#bloom').value)/100;$('#bloom-value').textContent=$('#bloom').value+'%';};
$('#dof').oninput=()=>{cameraEffects.dof.uniforms.aperture.value=Number($('#dof').value)*.000075;$('#dof-value').textContent=$('#dof').value+'%';};
$('#environment').oninput=()=>{scene.environmentIntensity=Number($('#environment').value)/100;$('#environment-value').textContent=$('#environment').value+'%';};
let audioContext;function chime(){if(muted)return;try{audioContext??=new AudioContext();audioContext.resume();[880,1174.66,1567.98].forEach((f,i)=>{const osc=audioContext.createOscillator(),gain=audioContext.createGain(),t=audioContext.currentTime+i*.09;osc.type='sine';osc.frequency.value=f;gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.045,t+.012);gain.gain.exponentialRampToValueAtTime(.0001,t+.8);osc.connect(gain);gain.connect(audioContext.destination);osc.start(t);osc.stop(t+.85);});}catch{}}
function toast(text){$('#status').textContent=text;$('#status').classList.remove('pulse');requestAnimationFrame(()=>$('#status').classList.add('pulse'));}
document.querySelectorAll('[data-palette]').forEach(b=>b.onclick=()=>{paletteKey=b.dataset.palette;document.querySelectorAll('[data-palette]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));createSceneProps();toast(palettes[paletteKey].name+' 팔레트로 바꿨어요');chime();});
document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{tool=b.dataset.tool;document.querySelectorAll('[data-tool]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));toast((tool==='bell'?'종':'방울')+'을 달 곳을 트리에서 눌러주세요');});
$('#ribbon').onchange=()=>{ribbon.visible=$('#ribbon').checked;};
$('#rotate').onclick=()=>{controls.autoRotate=!controls.autoRotate;$('#rotate').setAttribute('aria-pressed',String(controls.autoRotate));toast(controls.autoRotate?'천천히 돌아가는 겨울':'자동 회전을 멈췄어요');};
$('#sound').onclick=()=>{muted=!muted;$('#sound').setAttribute('aria-pressed',String(!muted));$('#sound-label').textContent=muted?'소리 꺼짐':'소리 켜짐';chime();};
$('#shake').onclick=()=>{shakePower=1;for(let i=0;i<snowCount;i++)spawnSnow(i);chime();toast('눈송이가 다시 춤을 춰요');};
$('#reset-view').onclick=()=>{camera.position.set(7.2,5.1,10.5);controls.target.set(0,2.45,0);controls.update();toast('처음 시점으로 돌아왔어요');};
$('#undo').onclick=()=>{if(placements.length>initialDecor.length){placements.pop();createSceneProps();toast('마지막 장식을 지웠어요');}else toast('추가한 장식이 없어요');};
$('#reset-decor').onclick=()=>{placements=initialDecor.map(o=>({...o}));createSceneProps();toast('처음 장식으로 되돌렸어요');};
$('#add-ornament').onclick=()=>{if(!ready)return;if(placements.length>=40){toast('장식은 40개까지 달 수 있어요');return;}const i=placements.length-initialDecor.length,y=1.4+(i%4)*.55,r=1.0-(y-.8)*.24,a=.2+(i%7)*.65;placements.push({type:tool,x:-.43+Math.sin(a)*r,y,z:-.25+Math.cos(a)*r,variant:i%3});createSceneProps();chime();toast('장식을 하나 달았어요');};
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let pointerDown=null;
canvas.addEventListener('pointerdown',e=>{pointerDown={x:e.clientX,y:e.clientY};});
canvas.addEventListener('pointerup',e=>{if(!ready||!pointerDown||Math.hypot(e.clientX-pointerDown.x,e.clientY-pointerDown.y)>6)return;pointerDown=null;if(placements.length>=40){toast('장식은 40개까지 달 수 있어요');return;}const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObject(treeMesh,true)[0];if(!hit)return;const q=miniature.worldToLocal(hit.point.clone());if(q.y<1||q.y>4.05)return;const out=new THREE.Vector3(q.x+.43,0,q.z+.25).normalize();q.addScaledVector(out,.09);q.y-=.09;placements.push({type:tool,x:q.x,y:q.y,z:q.z,variant:placements.length%3});createSceneProps();chime();toast('나만의 장식을 달았어요');});
function download(data,name,type){const blob=data instanceof Blob?data:new Blob([data],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}
$('#capture').onclick=()=>{cameraEffects.render(performance.now()/1000);canvas.toBlob(blob=>{if(blob)download(blob,'Winter_Atelier_Snowglobe.png','image/png');});toast('현재 모습을 PNG로 저장했어요');};
$('#export').onclick=async()=>{if(!ready)return;const btn=$('#export');btn.disabled=true;btn.textContent='3D 파일을 준비하고 있어요…';const exportRoot=world.clone(true);exportRoot.rotation.set(0,0,0);const exportedSnow=exportRoot.getObjectByName('Animated_Snow');if(exportedSnow)exportRoot.remove(exportedSnow);try{const exporter=new GLTFExporter(),result=await exporter.parseAsync(exportRoot,{binary:true,onlyVisible:true,maxTextureSize:2048});download(result,'Winter_Atelier_Snowglobe.glb','model/gltf-binary');toast('Blender·Unity용 GLB를 저장했어요');}catch(e){console.error(e);toast('내보내기에 실패했어요. 다시 시도해 주세요.');}finally{btn.disabled=false;btn.textContent='완성 스노우볼 GLB 내려받기 ↗';}};
let previous=performance.now();function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-previous)/1000,.04),t=now/1000;previous=now;snowMat.uniforms.time.value=t;shakePower=Math.max(0,shakePower-dt*.24);world.rotation.z=Math.sin(t*22)*.035*shakePower;world.rotation.x=Math.cos(t*18)*.018*shakePower;for(let i=0;i<snowGeo.drawRange.count;i++){const j=i*3;snowPositions[j+1]-=dt*snowSpeeds[i]*(1+shakePower*4);snowPositions[j]+=Math.sin(t*.7+snowPhases[i])*dt*(.035+shakePower*.3);snowPositions[j+2]+=Math.cos(t*.6+snowPhases[i])*dt*(.035+shakePower*.3);const y=snowPositions[j+1],r=Math.hypot(snowPositions[j],snowPositions[j+2]),maxR=Math.sqrt(Math.max(0,2.5**2-(y-2.35)**2));if(y<.6||r>maxR)spawnSnow(i,false);}snowGeo.attributes.position.needsUpdate=true;controls.update();cameraEffects.render(t);}requestAnimationFrame(animate);
