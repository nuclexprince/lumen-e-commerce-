import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const STYLE = "premium editorial product photography, warm off-white studio background, soft diffused studio lighting, subtle long shadows, minimalist luxury aesthetic, sophisticated muted tones with subtle electric blue accent, ultra detailed, 8k, art-directed, clean composition";

const jobs = [
  { dir: 'public/products', name: 'aurora-earbuds.png', size: '1024x1024', prompt: `Floating premium wireless earbuds in a frosted glass case, brushed silver metal, minimalist futuristic design${STYLE}` },
  { dir: 'public/products', name: 'halo-speaker.png', size: '1024x1024', prompt: `Sculptural ambient smart speaker, matte charcoal sphere on a brushed aluminum base, soft glowing ring of light${STYLE}` },
  { dir: 'public/products', name: 'pulse-watch.png', size: '1024x1024', prompt: `Luxury smartwatch with sapphire glass face, woven charcoal band, floating at a slight angle, refined detailing${STYLE}` },
  { dir: 'public/products', name: 'eclipse-coat.png', size: '864x1152', prompt: `Editorial fashion shot of a tailored charcoal wool overcoat on an invisible mannequin, draped elegantly${STYLE}` },
  { dir: 'public/products', name: 'nimbus-scarf.png', size: '1024x1024', prompt: `Cashmere scarf in soft silver grey draped in flowing folds, luxurious textile close-up${STYLE}` },
  { dir: 'public/products', name: 'velocity-runner.png', size: '1024x1024', prompt: `Futuristic running sneaker, knit upper in charcoal with electric blue sole detail, floating side profile${STYLE}` },
  { dir: 'public/products', name: 'drift-sneaker.png', size: '1024x1024', prompt: `Minimalist leather sneaker in warm off-white, clean lines, floating three-quarter view${STYLE}` },
  { dir: 'public/products', name: 'solace-tote.png', size: '1024x1024', prompt: `Structured leather tote bag in warm taupe, premium minimal hardware, standing upright${STYLE}` },
  { dir: 'public/products', name: 'ember-sunglasses.png', size: '1024x1024', prompt: `Sculptural sunglasses with thin silver frames and subtle tinted lenses, floating on a soft shadow${STYLE}` },
  { dir: 'public/products', name: 'lumen-lamp.png', size: '1024x1024', prompt: `Ceramic table lamp with a soft glowing diffuser, warm off-white glaze, minimalist sculptural form${STYLE}` },
  { dir: 'public/products', name: 'verve-coffee.png', size: '1024x1024', prompt: `Pour-over coffee set, matte black ceramic carafe and glass server on a brushed steel tray, steam rising${STYLE}` },
  { dir: 'public/products', name: 'monolith-charger.png', size: '1024x1024', prompt: `Sculptural wireless charging pad in matte charcoal with a soft blue charging indicator glow${STYLE}` },
  { dir: 'public/categories', name: 'electronics.png', size: '864x1152', prompt: `Collection of premium futuristic electronics devices arranged on a warm off-white pedestal, cinematic lighting${STYLE}` },
  { dir: 'public/categories', name: 'fashion.png', size: '864x1152', prompt: `Editorial luxury fashion still life, draped charcoal and silver garments, sophisticated composition${STYLE}` },
  { dir: 'public/categories', name: 'sneakers.png', size: '864x1152', prompt: `Row of premium futuristic sneakers in muted tones on a warm off-white surface, dramatic side lighting${STYLE}` },
  { dir: 'public/categories', name: 'accessories.png', size: '864x1152', prompt: `Luxury accessories flat lay, leather goods, sunglasses and metal objects on warm off-white, art-directed${STYLE}` },
  { dir: 'public/categories', name: 'lifestyle.png', size: '864x1152', prompt: `Minimalist luxury lifestyle scene, ceramic objects and soft light, calm sophisticated atmosphere${STYLE}` },
  { dir: 'public/editorial', name: 'ed-1.png', size: '864x1152', prompt: `Single sculptural product hero shot of a frosted glass object with electric blue light, dramatic studio composition${STYLE}` },
  { dir: 'public/editorial', name: 'ed-2.png', size: '864x1152', prompt: `Editorial portrait of a flowing silver fabric draped in motion, luxury textile abstract${STYLE}` },
  { dir: 'public/editorial', name: 'ed-3.png', size: '864x1152', prompt: `Minimalist ceramic vessel with a single stem, soft shadow, warm off-white, sculptural still life${STYLE}` },
  { dir: 'public/editorial', name: 'ed-4.png', size: '864x1152', prompt: `Cinematic product hero, a floating futuristic device emitting a soft electric blue glow against warm off-white${STYLE}` },
  { dir: 'public/brand', name: 'atelier.png', size: '1344x768', prompt: `Minimalist design atelier, hands crafting a premium object on a workbench, warm natural light through large windows, sophisticated muted palette${STYLE}` },
  { dir: 'public/brand', name: 'promo.png', size: '1344x768', prompt: `Cinematic wide banner of premium futuristic products floating in a void of soft light, warm off-white and charcoal with subtle electric blue glow, luxury campaign aesthetic${STYLE}` },
];

process.on('unhandledRejection', (e) => { console.error('UNHANDLED_REJECTION:', e?.message || e); });
process.on('uncaughtException', (e) => { console.error('UNCAUGHT_EXCEPTION:', e?.message || e); });

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout_' + ms)), ms)),
  ]);
}

async function genOne(zai, j) {
  const outPath = path.join(process.cwd(), j.dir, j.name);
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 3000) {
    return { skip: true };
  }
  const res = await withTimeout(
    zai.images.generations.create({ prompt: j.prompt, size: j.size }),
    120000
  );
  if (!res?.data?.[0]?.base64) throw new Error('no_base64');
  const buf = Buffer.from(res.data[0].base64, 'base64');
  fs.writeFileSync(outPath, buf);
  return { skip: false, size: buf.length };
}

async function main() {
  const BATCH_LIMIT = parseInt(process.env.BATCH_LIMIT || '0', 10);
  const remaining = jobs.filter(j => {
    const p = path.join(process.cwd(), j.dir, j.name);
    return !(fs.existsSync(p) && fs.statSync(p).size > 3000);
  });
  if (remaining.length === 0) { console.log('ALL_DONE'); return; }
  const todo = BATCH_LIMIT > 0 ? remaining.slice(0, BATCH_LIMIT) : remaining;
  console.log(`START remaining=${remaining.length}/${jobs.length} batch=${todo.length} limit=${BATCH_LIMIT}`);
  const zai = await ZAI.create();
  let ok = 0;
  for (let i = 0; i < todo.length; i++) {
    const j = todo[i];
    try {
      const t0 = Date.now();
      const r = await genOne(zai, j);
      if (r.skip) { console.log(`[${i+1}] SKIP ${j.dir}/${j.name}`); continue; }
      ok++;
      console.log(`[${i+1}/${todo.length}] OK ${((Date.now()-t0)/1000).toFixed(1)}s ${j.dir}/${j.name} ${(r.size/1024).toFixed(0)}KB`);
    } catch (e) {
      console.error(`[${i+1}/${todo.length}] FAIL ${j.dir}/${j.name}: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 1200));
  }
  console.log(`BATCH_DONE ok=${ok}`);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
