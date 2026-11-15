import test from 'node:test';import assert from 'node:assert/strict';
import {createMailbox} from '../src/props.js';import {createMailboxMotion,applyMailboxPose} from '../src/mailbox-motion.js';
import {cleanLetter,readLetter,saveLetter,wrapLetter,drawLetterCard} from '../src/letter-card.js';
import {setupLetterUI} from '../src/letter-ui.js';
const storage=()=>{let text=null;return {getItem:()=>text,setItem:(key,value)=>{text=value;}};};
test('door opens before letter emerges; callback fires once; closing and export restore rest',()=>{
 const root=createMailbox(),motion=createMailboxMotion();motion.bind(root);let opened=0;motion.open(()=>opened++);motion.update(.25);assert.equal(root.getObjectByName('Mailbox_Letter').visible,false);assert.ok(root.getObjectByName('Mailbox_Door').rotation.x>.3);
 motion.update(.7);motion.update(.1);assert.equal(opened,1);assert.equal(root.getObjectByName('Mailbox_Letter').position.z,.48);
 const replacement=createMailbox();motion.bind(replacement);assert.equal(replacement.getObjectByName('Mailbox_Letter').visible,true);
 const copy=replacement.clone(true);applyMailboxPose(copy);assert.equal(copy.getObjectByName('Mailbox_Door').rotation.x,0);assert.equal(replacement.getObjectByName('Mailbox_Letter').visible,true);
 motion.close();motion.update(1);assert.equal(replacement.getObjectByName('Mailbox_Door').rotation.x,0);assert.equal(replacement.getObjectByName('Mailbox_Letter').visible,false);
});
test('local drafts round-trip, malformed data and blocked storage are safe',()=>{
 const s=storage(),letter={to:'소연',from:'겨울',message:'안녕!\n따뜻한 겨울 보내.'};assert.equal(saveLetter(s,letter),true);assert.deepEqual(readLetter(s),letter);
 assert.deepEqual(readLetter({getItem:()=>'{broken'}),{to:'',from:'',message:''});assert.equal(saveLetter(undefined,letter),false);assert.equal(cleanLetter({to:123,message:'가'.repeat(310)}).message.length,300);
});
const context=()=>({font:'',texts:[],fillRect(){},strokeRect(){},drawImage(){},measureText:s=>({width:Array.from(s).length*28}),fillText(text,x,y){this.texts.push({text,x,y});}});
test('card wraps Korean and preserves all message lines without clipping',()=>{
 assert.deepEqual(wrapLetter('가나다라\n마바',s=>s.length*10,20),['가나','다라','마바']);
 const ctx=context(),card={getContext:()=>ctx};const message=Array(35).fill('반짝이는 겨울').join('\n');drawLetterCard(card,{width:1200,height:900},{message,to:'소연',from:'겨울'});
 const rendered=ctx.texts.filter(x=>x.text==='반짝이는 겨울');assert.equal(rendered.length,35);assert.ok(rendered.at(-1).y<card.height-155);
});
test('letter UI opens, saves, downloads and closes using the same draft',async()=>{
 class Element extends EventTarget{value='';textContent='';open=false;disabled=false;showModal(){this.open=true;}close(){this.open=false;this.dispatchEvent(new Event('close'));}focus(){}setCustomValidity(v){this.validation=v;}reportValidity(){}}
 const ids=['letter-dialog','letter-form','letter-status','letter-to','letter-from','letter-message','letter-count','letter-close','letter-download'],elements=Object.fromEntries(ids.map(id=>['#'+id,new Element()]));
 const s=storage(),oldDocument=globalThis.document,oldWindow=globalThis.window;let closed=0,downloaded=0;
 globalThis.window={localStorage:s};globalThis.document={querySelector:id=>elements[id],createElement:()=>({getContext:()=>context(),toBlob:cb=>cb(new Blob(['png']))})};
 try{const ui=setupLetterUI({onClose:()=>closed++,getSceneCanvas:()=>({width:900,height:900}),download:()=>downloaded++});ui.open();assert.equal(ui.isOpen,true);elements['#letter-message'].value='메리 크리스마스!';elements['#letter-form'].dispatchEvent(new Event('input'));assert.equal(readLetter(s).message,'메리 크리스마스!');await elements['#letter-download'].onclick();assert.equal(downloaded,1);assert.equal(elements['#letter-download'].disabled,false);elements['#letter-form'].dispatchEvent(new Event('submit',{cancelable:true}));assert.equal(closed,1);assert.equal(ui.isOpen,false);}finally{globalThis.document=oldDocument;globalThis.window=oldWindow;}
});
