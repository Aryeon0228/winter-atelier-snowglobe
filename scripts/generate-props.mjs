import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {createBauble,createBell,createGift,createRibbon,createBase,createDome,createSnowman,createMailbox,palettes} from '../src/props.js';
import fs from 'node:fs/promises';
globalThis.FileReader=class{async readAsArrayBuffer(blob){this.result=await blob.arrayBuffer();this.onloadend?.();}async readAsDataURL(blob){this.result='data:'+blob.type+';base64,'+Buffer.from(await blob.arrayBuffer()).toString('base64');this.onloadend?.();}};
await fs.mkdir('docs/assets/props',{recursive:true});
const exporter=new GLTFExporter();
const objects={bauble:createBauble(),bell:createBell(),gift:createGift(),ribbon:createRibbon(),base:createBase(),dome:createDome(),snowman:createSnowman(),mailbox:createMailbox()};
for(const [name,obj] of Object.entries(objects)){const data=await exporter.parseAsync(obj,{binary:true});await fs.writeFile('docs/assets/props/'+name+'.glb',Buffer.from(data));console.log(name,data.byteLength);}
for(const [name,palette] of Object.entries(palettes)){for(let i=0;i<3;i++){const obj=createGift(palette,i);const data=await exporter.parseAsync(obj,{binary:true});await fs.writeFile(`docs/assets/props/gift-${name}-${i+1}.glb`,Buffer.from(data));}}
