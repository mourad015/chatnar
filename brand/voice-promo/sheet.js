// Contact sheet: node sheet.js out.png w h t1 t2 ...
const { chromium } = require('playwright'), path=require('path');
(async()=>{const [out,w,h,...ts]=process.argv.slice(2);const b=await chromium.launch({args:['--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:+w,height:+h}});p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>console.log('LOG',m.text()));
await p.goto('file://'+path.resolve(__dirname,'promo.html')+`?w=${w}&h=${h}`);console.log('ready',await p.evaluate(()=>window.ready));
const files=[];for(const t of ts){await p.evaluate(t=>render(t),+t);const f=`/tmp/claude-0/-home-user-chatnar/183d5ccf-bf77-5cc5-a68b-f7e9c009975d/scratchpad/s_${t}.png`;await p.screenshot({path:f});files.push(f)}
await b.close();require('child_process').execSync(`montage ${files.join(' ')} -tile ${w>h?3:6}x -geometry ${w>h?'640x360':'270x480'}+4+4 -background '#777' ${out}`);})();
