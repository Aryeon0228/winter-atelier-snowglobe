export const SNOWMAN_JUMP_DURATION=1.6;
export const SNOWMAN_REACTION_DURATION=2.4;
const smooth=x=>x*x*(3-2*x);
function curve(time,keys){
  for(let i=1;i<keys.length;i++){const [end,b]=keys[i],[start,a]=keys[i-1];if(time<=end)return a+(b-a)*smooth(Math.max(0,(time-start)/(end-start)));}
  return keys.at(-1)[1];
}
function hop(t,start,end,height){if(t<=start||t>=end)return 0;const p=(t-start)/(end-start);return height*4*p*(1-p);}
export function sampleSnowmanJump(time){
  const t=Math.max(0,Math.min(SNOWMAN_JUMP_DURATION,time));
  const lift=hop(t,.14,.84,.52)+hop(t,.92,1.12,.045);
  const squash=curve(t,[[0,1],[.10,.83],[.17,1.10],[.32,1],[.80,1],[.87,.83],[1,1.06],[1.15,.98],[1.35,1]]);
  const headGap=curve(t,[[0,0],[.17,0],[.43,.25],[.63,.30],[.91,.13],[1.08,0],[1.18,.025],[1.32,0]]);
  const hatGap=curve(t,[[0,0],[.23,0],[.54,.48],[.72,.50],[1.06,.14],[1.22,0],[1.32,.025],[1.48,0]]);
  const headLift=lift+.88*(squash-1)*.85+headGap;
  const wobble=hop(t,.23,1.45,1)*Math.sin((t-.23)*Math.PI*2/1.22);
  const surprise=curve(t,[[0,0],[.1,.15],[.2,1],[.9,1],[1.35,0]]);
  return {bodyY:lift,bodyScaleY:squash,bodyScaleXZ:1/Math.sqrt(squash),headY:.88+headLift,headAngle:.10*wobble,hatY:1.075+headLift+hatGap,hatAngle:.29+.30*wobble,eyeX:1+surprise*.18,eyeY:1+surprise*.30,headGap,hatGap};
}
export function sampleScarfFlutter(time,index=0){
  const t=Math.max(0,time);if(t>=SNOWMAN_REACTION_DURATION)return {lift:0,twist:0,bend:0};
  const wave=(start,frequency,decay)=>{const u=t-start;return u<=0?0:Math.exp(-decay*u)*(1-Math.cos(frequency*u));};
  const fade=1-smooth(Math.max(0,Math.min(1,(t-1.8)/.6)));
  const lift=(.48*wave(.18+index*.045,10-index,3.2)+.26*wave(.86+index*.055,14-index,3.5))*fade;
  const twist=(index===0?-1:1)*.10*lift;
  return {lift,twist,bend:Math.min(1,lift*1.8)};
}
export function applySnowmanPose(root,time=SNOWMAN_REACTION_DURATION){
  const body=root.getObjectByName('Snowman_Body'),head=root.getObjectByName('Snowman_Head'),hat=root.getObjectByName('Snowman_Pointy_Hat');
  if(!body||!head||!hat)return;
  const p=sampleSnowmanJump(time);
  body.position.y=p.bodyY;body.scale.set(p.bodyScaleXZ,p.bodyScaleY,p.bodyScaleXZ);
  head.position.y=p.headY;head.rotation.z=p.headAngle;
  hat.position.y=p.hatY;hat.rotation.z=p.hatAngle;
  for(const name of ['Snowman_Eye_L','Snowman_Eye_R'])root.getObjectByName(name)?.scale.set(p.eyeX,p.eyeY,1);
  for(const [index,side] of ['L','R'].entries()){
    const tail=root.getObjectByName('Snowman_Scarf_'+side),fabric=root.getObjectByName('Snowman_Scarf_Fabric_'+side),motion=sampleScarfFlutter(time,index);
    if(tail){tail.rotation.x=-motion.lift||0;tail.rotation.z=(index===0?-.16:.10)+motion.twist;}
    if(fabric)fabric.morphTargetInfluences[0]=motion.bend;
  }
}
export function createSnowmanMotion(){
  let root=null,elapsed=SNOWMAN_REACTION_DURATION;
  return {
    bind(next){root=next;applySnowmanPose(root,elapsed);},
    jump(){if(!root||elapsed<SNOWMAN_REACTION_DURATION)return false;elapsed=0;applySnowmanPose(root,elapsed);return true;},
    update(delta){if(!root||elapsed>=SNOWMAN_REACTION_DURATION)return;elapsed=Math.min(SNOWMAN_REACTION_DURATION,elapsed+Math.max(0,delta));applySnowmanPose(root,elapsed);},
    reset(){elapsed=SNOWMAN_REACTION_DURATION;if(root)applySnowmanPose(root,elapsed);},
    get active(){return elapsed<SNOWMAN_REACTION_DURATION;},
  };
}
