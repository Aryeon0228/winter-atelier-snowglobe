const clamp=t=>Math.max(0,Math.min(1,t));
const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
export const GIFT_DURATION=2.7;
export const GIFT_BURST_TIME=.34;
export function applyGiftPose(root,time=GIFT_DURATION){
  const lid=root.getObjectByName('Gift_Lid');if(!lid)return;
  const t=Math.max(0,time);
  let lift=0,wiggle=0;
  if(t<.16)wiggle=Math.sin(t/.16*Math.PI*4)*.045*Math.sin(t/.16*Math.PI);
  else if(t<.62)lift=1-Math.pow(1-clamp((t-.16)/.46),3);
  else if(t<1.38)lift=1+Math.sin((t-.62)/.76*Math.PI)*.045;
  else if(t<2.12)lift=1-smooth((t-1.38)/.74);
  else if(t<GIFT_DURATION)lift=.045*Math.sin((t-2.12)/(GIFT_DURATION-2.12)*Math.PI*2)**2*(1-(t-2.12)/(GIFT_DURATION-2.12));
  lid.position.set(0,.76+lift,0);
  lid.rotation.set(-.20*lift||0,.10*lift||0,.12*lift+wiggle||0);
}
export function createGiftMotion(onBurst=()=>{}){
  const states=new Map();
  return {
    bind(key,root){let state=states.get(key);if(!state){state={root,time:GIFT_DURATION,burst:false};states.set(key,state);}state.root=root;applyGiftPose(root,state.time);},
    open(key){const state=states.get(key);if(!state||state.time<GIFT_DURATION)return false;state.time=0;state.burst=false;applyGiftPose(state.root,0);return true;},
    update(dt){for(const state of states.values()){
      if(state.time>=GIFT_DURATION)continue;
      state.time=Math.min(GIFT_DURATION,state.time+Math.max(0,dt));applyGiftPose(state.root,state.time);
      if(!state.burst&&state.time>=GIFT_BURST_TIME){state.burst=true;onBurst(state.root,state.time-GIFT_BURST_TIME);}
    }},
    reset(){for(const state of states.values()){state.time=GIFT_DURATION;state.burst=false;applyGiftPose(state.root);}},
  };
}
