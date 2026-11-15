import {readLetter,saveLetter,drawLetterCard} from './letter-card.js';
export function setupLetterUI({onClose,getSceneCanvas,download}){
 const $=s=>document.querySelector(s),dialog=$('#letter-dialog'),form=$('#letter-form'),status=$('#letter-status'),fields={to:$('#letter-to'),from:$('#letter-from'),message:$('#letter-message')};
 let storage;try{storage=window.localStorage;}catch{}
 const draft=readLetter(storage);for(const key in fields)fields[key].value=draft[key];
 const value=()=>Object.fromEntries(Object.entries(fields).map(([key,input])=>[key,input.value]));
 const persist=()=>{const ok=saveLetter(storage,value());status.textContent=ok?'이 브라우저에 편지를 보관했어요.':'브라우저에 보관할 수 없어요. 카드 이미지로 저장해 주세요.';$('#letter-count').textContent=fields.message.value.length+' / 300';return ok;};
 form.addEventListener('input',persist);$('#letter-count').textContent=draft.message.length+' / 300';
 $('#letter-close').onclick=()=>dialog.close();
 form.addEventListener('submit',e=>{e.preventDefault();if(!fields.message.value.trim()){fields.message.setCustomValidity('편지 내용을 적어주세요.');fields.message.reportValidity();return;}persist();dialog.close();});
 dialog.addEventListener('close',()=>onClose());
 $('#letter-download').onclick=async()=>{
   if(!fields.message.value.trim()){fields.message.setCustomValidity('편지 내용을 적어주세요.');fields.message.reportValidity();return;}
   fields.message.setCustomValidity('');persist();const button=$('#letter-download');button.disabled=true;
   try{const card=drawLetterCard(document.createElement('canvas'),getSceneCanvas(),value());const blob=await new Promise(resolve=>card.toBlob(resolve,'image/png'));if(!blob)throw Error('PNG unavailable');download(blob,'Winter_Atelier_Letter.png','image/png');status.textContent='스노우돔과 편지를 카드 이미지로 저장했어요.';}catch(e){console.error(e);status.textContent='이미지를 저장하지 못했어요. 다시 눌러주세요.';}finally{button.disabled=false;}
 };
 fields.message.addEventListener('input',()=>fields.message.setCustomValidity(''));
 return {open(){if(!dialog.open){dialog.showModal();fields.message.focus();}},get isOpen(){return dialog.open;}};
}
