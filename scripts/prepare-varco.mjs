import {NodeIO} from '@gltf-transform/core';
import {textureCompress} from '@gltf-transform/functions';
import sharp from 'sharp';
import fs from 'node:fs';
const [source,destination]=process.argv.slice(2);
if(!source||!destination)throw new Error('Usage: node scripts/prepare-varco.mjs source.glb destination.glb');
const io=new NodeIO(),doc=await io.read(source);
await doc.transform(textureCompress({encoder:sharp,slots:/baseColorTexture/,targetFormat:'jpeg',resize:[2048,2048],quality:90}),textureCompress({encoder:sharp,slots:/normalTexture/,targetFormat:'png',resize:[1024,1024]}));
await io.write(destination,doc);console.log(destination,fs.statSync(destination).size);
