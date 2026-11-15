const smooth=t=>t*t*(3-2*t);
export function applyMailboxPose(root,progress=0){
  const p=Math.max(0,Math.min(1,progress)),door=root.getObjectByName('Mailbox_Door'),letter=root.getObjectByName('Mailbox_Letter');
  if(door)door.rotation.x=smooth(Math.min(1,p/.65))*1.40;
  if(letter){const rise=smooth(Math.max(0,(p-.35)/.65));letter.visible=p>.35;letter.position.set(0,.96+.37*rise,.48*rise);letter.rotation.set(0,0,-.12*rise);}
}
export function createMailboxMotion(){
  let root=null,progress=0,target=0,onOpened=null;
  return {
    bind(next){root=next;applyMailboxPose(root,progress);},
    open(callback){target=1;onOpened=callback;},
    close(){target=0;onOpened=null;},
    update(dt){progress=Math.max(0,Math.min(1,progress+(target?1:-1)*Math.max(0,dt)/.85));if(root)applyMailboxPose(root,progress);if(progress===1&&onOpened){const cb=onOpened;onOpened=null;cb();}},
  };
}
