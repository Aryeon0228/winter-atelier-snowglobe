export const LETTER_KEY='winter-atelier-letter-v1';
export function cleanLetter(value){const input=value&&typeof value==='object'?value:{};return {to:typeof input.to==='string'?input.to.slice(0,40):'',from:typeof input.from==='string'?input.from.slice(0,40):'',message:typeof input.message==='string'?input.message.slice(0,300):''};}
export function readLetter(storage){try{return cleanLetter(JSON.parse(storage.getItem(LETTER_KEY)||'{}'));}catch{return cleanLetter({});}}
export function saveLetter(storage,value){try{storage.setItem(LETTER_KEY,JSON.stringify(cleanLetter(value)));return true;}catch{return false;}}
export function wrapLetter(text,measure,width){
 const lines=[];for(const paragraph of text.replace(/\r\n?/g,'\n').split('\n')){let line='';for(const char of Array.from(paragraph)){if(line&&measure(line+char)>width){lines.push(line);line='';}line+=char;}lines.push(line);}return lines;
}
export function drawLetterCard(card,sceneCanvas,value){
 const letter=cleanLetter(value),ctx=card.getContext('2d'),font='"Apple SD Gothic Neo", "Noto Sans KR", sans-serif';
 ctx.font=`28px ${font}`;const lines=wrapLetter(letter.message,t=>ctx.measureText(t).width,960);
 card.width=1200;card.height=Math.max(1600,1120+lines.length*43+180);
 ctx.fillStyle='#f6f2ea';ctx.fillRect(0,0,card.width,card.height);
 ctx.strokeStyle='#c6b283';ctx.lineWidth=2;ctx.strokeRect(40,40,1120,card.height-80);
 ctx.fillStyle='#294239';ctx.font='italic 52px Georgia';ctx.fillText('A Little Winter, For You',86,118);
 const x=80,y=158,w=1040,h=710,scale=Math.min(w/sceneCanvas.width,h/sceneCanvas.height),iw=sceneCanvas.width*scale,ih=sceneCanvas.height*scale;
 ctx.fillStyle='#202a26';ctx.fillRect(x,y,w,h);ctx.drawImage(sceneCanvas,x+(w-iw)/2,y+(h-ih)/2,iw,ih);
 ctx.fillStyle='#922f46';ctx.font=`500 30px ${font}`;ctx.fillText(letter.to?`To. ${letter.to}`:'To. 당신에게',120,946,960);
 ctx.fillStyle='#294239';ctx.font=`28px ${font}`;lines.forEach((line,i)=>ctx.fillText(line,120,1010+i*43));
 ctx.fillStyle='#922f46';ctx.font=`27px ${font}`;ctx.textAlign='right';ctx.fillText(letter.from?`From. ${letter.from}`:'따뜻한 마음을 담아',1080,card.height-155,960);
 ctx.textAlign='left';ctx.fillStyle='#87887c';ctx.font='16px Georgia';ctx.fillText('WINTER ATELIER  ·  STUDIO ARYEON',120,card.height-90);
 return card;
}
