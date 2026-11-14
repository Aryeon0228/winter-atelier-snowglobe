import {build} from 'esbuild';
await build({entryPoints:['src/app.js'],bundle:true,format:'esm',minify:true,sourcemap:false,outfile:'docs/app.js',legalComments:'linked'});
console.log('Built docs/app.js');
