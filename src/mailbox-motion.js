const smooth=t=>t*t*(3-2*t);
export const MAILBOX_REACTION_DURATION=.78;
export function mailboxStretch(time){
  const t=Math.max(0,time),keys=[[0,1],[.14,.90],[.34,1.09],[.54,.98],[MAILBOX_REACTION_DURATION,1]];
  for(let i=1;i<keys.length;i++)if(t<keys[i][0]){const [start,a]=keys[i-1],[end,b]=keys[i];return a+(b-a)*smooth((t-start)/(end-start));}
  return 1;
}
export function applyMailboxPose(root,progress=0,reactionTime=MAILBOX_REACTION_DURATION){
  const p=Math.max(0,Math.min(1,progress)),door=root.getObjectByName('Mailbox_Door'),letter=root.getObjectByName('Mailbox_Letter'),reaction=root.getObjectByName('Mailbox_Reaction');
  if(reaction){const y=mailboxStretch(reactionTime),width=1/Math.sqrt(y);reaction.scale.set(width,y,width);}
  if(door)door.rotation.x=smooth(Math.min(1,p/.65))*1.40;
  if(letter){const rise=smooth(Math.max(0,(p-.35)/.65));letter.visible=p>.35;letter.position.set(0,.96+.37*rise,.48*rise);letter.rotation.set(0,0,-.12*rise);}
}
export function createMailboxMotion(){
  let root=null,progress=0,target=0,onOpened=null,reactionTime=MAILBOX_REACTION_DURATION;
  return {
    bind(next){root=next;applyMailboxPose(root,progress,reactionTime);},
    open(callback){if(target!==1)reactionTime=0;target=1;onOpened=callback;},
    close(){target=0;onOpened=null;reactionTime=MAILBOX_REACTION_DURATION;},
    update(dt){const step=Math.max(0,dt);reactionTime=Math.min(MAILBOX_REACTION_DURATION,reactionTime+step);progress=Math.max(0,Math.min(1,progress+(target?1:-1)*step/.85));if(root)applyMailboxPose(root,progress,reactionTime);if(progress===1&&onOpened){const cb=onOpened;onOpened=null;cb();}},
  };
}
