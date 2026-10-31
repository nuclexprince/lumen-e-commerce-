import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
process.on('unhandledRejection', e => console.error('UR:', e?.message||e));
process.on('uncaughtException', e => console.error('UCE:', e?.message||e));
console.log('init...');
const zai = await ZAI.create();
console.log('created SDK');
const t0 = Date.now();
const res = await zai.images.generations.create({
  prompt: 'Sculptural ambient smart speaker, matte charcoal sphere, soft glowing ring of light, premium editorial product photography, warm off-white studio background, soft diffused lighting, minimalist luxury',
  size: '1024x1024',
});
console.log('got response in', ((Date.now()-t0)/1000).toFixed(1)+'s');
const buf = Buffer.from(res.data[0].base64, 'base64');
fs.writeFileSync('public/products/halo-speaker.png', buf);
console.log('wrote', buf.length, 'bytes');
