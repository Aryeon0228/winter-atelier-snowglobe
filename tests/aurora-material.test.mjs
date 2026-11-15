import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {mat,palettes,createGift,createBase,createMailbox,createSnowman,createBauble} from '../src/props.js';

test('aurora highlights tint reflected light while preserving base colors and fabric roughness',()=>{
 const purple=mat(palettes.aurora.red,.18,.37),cyan=mat(palettes.aurora.green,.15,.3),silver=mat(palettes.aurora.gold,.7,.25),cloth=mat(palettes.aurora.red,0,.86);
 for(const [m,color] of [[purple,palettes.aurora.red],[cyan,palettes.aurora.green],[silver,palettes.aurora.gold],[cloth,palettes.aurora.red]]){assert.ok(m.isMeshPhysicalMaterial);assert.equal(m.color.getHexString(),color.slice(1));assert.equal(m.emissive.getHex(),0);}
 assert.ok(purple.specularColor.g>purple.specularColor.r*4&&purple.specularColor.b>purple.specularColor.r*4);
 for(const m of [cyan,silver])assert.ok(m.specularColor.r>m.specularColor.g*3&&m.specularColor.b>m.specularColor.g*3);
 assert.ok(purple.roughness<.25&&purple.clearcoat>0);assert.equal(cloth.roughness,.86);assert.equal(cloth.clearcoat,0);assert.ok(cloth.sheen>.5);
 const classic=mat(palettes.classic.red,.18,.37),snow=mat(palettes.snow.green,.15,.3);assert.ok(!classic.isMeshPhysicalMaterial&&!snow.isMeshPhysicalMaterial);assert.equal(classic.metalness,.18);assert.equal(classic.roughness,.37);
 for(const root of [createGift(palettes.aurora),createBase(palettes.aurora),createMailbox(palettes.aurora),createSnowman(palettes.aurora),createBauble(palettes.aurora)]){
  const selected=[];root.traverse(o=>{if(o.isMesh&&o.material.color?.getHexString()===palettes.aurora.red.slice(1))selected.push(o.material);});assert.ok(selected.length);assert.ok(selected.every(m=>m.isMeshPhysicalMaterial&&m.specularColor.equals(purple.specularColor)));
 }
});

test('GLB export preserves cyan and magenta specular colors, coating and sheen',async()=>{
 const previous=globalThis.FileReader;globalThis.FileReader=class{async readAsArrayBuffer(blob){this.result=await blob.arrayBuffer();this.onloadend?.();}async readAsDataURL(blob){this.result='data:'+blob.type+';base64,'+Buffer.from(await blob.arrayBuffer()).toString('base64');this.onloadend?.();}};
 try{
  const group=new T.Group();group.add(createGift(palettes.aurora,0),createGift(palettes.aurora,2));
  const glb=await new GLTFExporter().parseAsync(group,{binary:true}),view=new DataView(glb),json=JSON.parse(new TextDecoder().decode(new Uint8Array(glb,20,view.getUint32(12,true))));
  assert.ok(json.extensionsUsed.includes('KHR_materials_specular'));assert.ok(json.extensionsUsed.includes('KHR_materials_clearcoat'));assert.ok(json.extensionsUsed.includes('KHR_materials_sheen'));
  const highlights=json.materials.map(m=>m.extensions?.KHR_materials_specular?.specularColorFactor).filter(Boolean);assert.ok(highlights.some(([r,g,b])=>g>r*4&&b>r*4));assert.ok(highlights.some(([r,g,b])=>r>g*3&&b>g*3));
 }finally{globalThis.FileReader=previous;}
});
