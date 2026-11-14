import {build} from 'esbuild';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
await build({entryPoints:['src/app.js'],bundle:true,format:'esm',minify:true,sourcemap:false,outfile:'docs/app.js',legalComments:'linked'});
let html=await readFile('docs/index.html','utf8');
for(const asset of ['app.js','style.css']){
  const hash=createHash('sha256').update(await readFile('docs/'+asset)).digest('hex').slice(0,10);
  const pattern=new RegExp('(["\\\'])'+asset.replace('.','\\.')+'(?:\\?v=[^"\\\']*)?(["\\\'])','g');
  html=html.replace(pattern,(_,a,b)=>a+asset+'?v='+hash+b);
}
await writeFile('docs/index.html',html);
console.log('Built docs/app.js with versioned asset URLs');
