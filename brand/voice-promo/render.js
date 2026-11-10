// Renders promo frames in parallel: node render.js <outdir> <w> <h> [fps=60] [workers=4]
// Each worker is its own browser; frames are exported straight from the canvas as high-quality JPEG.
const { chromium } = require('playwright'), path=require('path'), fs=require('fs');
(async()=>{const [out,w,h,fps=60,nw=4,from=0,to]=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});const N=+(to||Math.round(43*fps));
await Promise.all([...Array(+nw)].map(async(_,k)=>{const b=await chromium.launch({args:['--allow-file-access-from-files']});
  const p=await b.newPage({viewport:{width:+w,height:+h}});
  await p.goto('file://'+path.resolve(__dirname,'promo.html')+`?w=${w}&h=${h}`);await p.evaluate(()=>window.ready);
  for(let i=+from+k;i<N;i+=+nw){const d=await p.evaluate(t=>{render(t);return document.getElementById('c').toDataURL('image/jpeg',.97)},i/fps);
    fs.writeFileSync(`${out}/f${String(i).padStart(5,'0')}.jpg`,Buffer.from(d.split(',')[1],'base64'))}
  await b.close()}));console.log('done',out)})();
