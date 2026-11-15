// Update the published scene offline without losing glTF material extensions.
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {mergeDocuments,unpartition,prune} from '@gltf-transform/functions';
import {giftLayout as layout,giftScales,characterLayout} from '../src/scene-layout.js';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc=await io.read('docs/assets/snowglobe.glb');
const root=doc.getRoot().listNodes().find(n=>n.getName()==='Winter_Atelier_Snowglobe');
for(let i=0;i<layout.length;i++){
 const [x,z,a]=layout[i],old=doc.getRoot().listNodes().find(n=>n.getName()===`Gift_${i+1}`),s=giftScales[i%3];
 const parent=old?.getParentNode()||root;if(old)old.dispose();
 const source=await io.read(`docs/assets/props/gift-classic-${i%3+1}.glb`),sourceScene=source.getRoot().listScenes()[0],node=sourceScene.listChildren()[0];
 const map=mergeDocuments(doc,source),added=map.get(node);added.setName(`Gift_${i+1}`).setTranslation([x,.625,z]).setScale([s,s,s]).setRotation([0,Math.sin(a/2),0,Math.cos(a/2)]);parent.addChild(added);map.get(sourceScene).dispose();
}
for(const [name,file,pos,a] of [['Snowman','snowman',characterLayout.snowman.position,characterLayout.snowman.yaw],['Christmas_Mailbox','mailbox',characterLayout.mailbox.position,characterLayout.mailbox.yaw]]){
 const old=doc.getRoot().listNodes().find(n=>n.getName()===name);if(old)old.dispose();
 const source=await io.read(`docs/assets/props/${file}.glb`),sourceScene=source.getRoot().listScenes()[0],node=sourceScene.listChildren()[0];
 const map=mergeDocuments(doc,source),added=map.get(node);added.setTranslation(pos).setRotation([0,Math.sin(a/2),0,Math.cos(a/2)]);root.addChild(added);map.get(sourceScene).dispose();
}
await doc.transform(prune(),unpartition());
await io.write('docs/assets/snowglobe.glb',doc);
console.log('Updated combined scene');
