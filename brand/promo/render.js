// Renders promo frames in parallel: node render.js <outdir> <w> <h> [fps=60] [workers=4]
const { chromium } = require('playwright'), path=require('path'), fs=require('fs');
(async()=>{const [out,w,h,fps=60,nw=4]=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});const N=40*fps;
const b=await chromium.launch({args:['--allow-file-access-from-files']});
await Promise.all([...Array(+nw)].map(async(_,k)=>{const p=await b.newPage({viewport:{width:+w,height:+h}});
  await p.goto('file://'+path.resolve(__dirname,'promo.html')+`?w=${w}&h=${h}`);await p.evaluate(()=>window.ready);
  for(let i=k;i<N;i+=+nw){await p.evaluate(t=>render(t),i/fps);await p.screenshot({path:`${out}/f${String(i).padStart(5,'0')}.png`})}}));
await b.close();console.log('done',out)})();
