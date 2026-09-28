// MarkGone engine offline test: runs the worker engine from index.html in Node
// before any browser testing (Audio-Inspector lesson: validate parsers/engines in Node first).
import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

// --- extract worker engine ---
const m = html.match(/<script type="text\/worker" id="engineSrc">([\s\S]*?)<\/script>/);
if (!m) { console.error('FAIL: engine script not found'); process.exit(1); }
const engineSrc = m[1];
writeFileSync('/tmp/mg-engine.js', engineSrc);

const selfStub = { postMessage() {} };
const engine = new Function('self', engineSrc + '\nreturn { inpaint, telea, laplace, grain, inpaintFine };')(selfStub);
const { inpaint } = engine;

// --- helpers ---
function makeScene(w, h) {
  // smooth but structured background: gradient + gentle sine banding (like sky/sea)
  const rgba = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    rgba[i] = 30 + x / w * 90 + 10 * Math.sin(y * 0.05);
    rgba[i + 1] = 90 + y / h * 100 + 12 * Math.sin(x * 0.03 + y * 0.02);
    rgba[i + 2] = 140 + 50 * Math.sin(x * 0.02 + y * 0.03);
    rgba[i + 3] = 255;
  }
  return rgba;
}
function stampRect(rgba, w, h, x0, y0, x1, y1, alpha) {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const i = (y * w + x) * 4;
    rgba[i] = rgba[i] * (1 - alpha) + 255 * alpha;
    rgba[i + 1] = rgba[i + 1] * (1 - alpha) + 255 * alpha;
    rgba[i + 2] = rgba[i + 2] * (1 - alpha) + 255 * alpha;
  }
}
function maskRect(w, h, x0, y0, x1, y1) {
  const m = new Uint8Array(w * h);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) m[y * w + x] = 255;
  return m;
}
function psnr(a, b) {
  let se = 0, n = 0;
  for (let i = 0; i < a.length; i += 4) {
    for (let c = 0; c < 3; c++) { const d = a[i + c] - b[i + c]; se += d * d; n++; }
  }
  const mse = se / n;
  return mse === 0 ? 99 : 10 * Math.log10(255 * 255 / mse);
}
function checkNoNaN(rgba) {
  for (let i = 0; i < rgba.length; i++) if (!Number.isFinite(rgba[i])) return false;
  return true;
}
let failed = 0;
function report(name, ok, detail) {
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + name + (detail ? '  — ' + detail : ''));
  if (!ok) failed++;
}

// --- test 1: center watermark on smooth background, 3 methods ---
{
  const w = 640, h = 420;
  const clean = makeScene(w, h);
  const marked = new Uint8ClampedArray(clean);
  stampRect(marked, w, h, 200, 160, 440, 240, 0.55); // big semi-transparent stamp
  const mask = maskRect(w, h, 195, 155, 445, 245);   // slightly beyond edges
  for (const method of [0, 1, 2]) {
    const test = new Uint8ClampedArray(marked);
    const t0 = performance.now();
    const n = inpaint(test, w, h, mask, method);
    const ms = performance.now() - t0;
    const p = psnr(test, clean);
    report(`method${method} center stamp`,
      n === 251 * 91 && checkNoNaN(test) && p > 20, // mask is 251x91 px
      `filled=${n} px, psnr=${p.toFixed(1)} dB, ${ms.toFixed(0)} ms`);
  }
}
// --- test 2: thin diagonal strokes (text-like) ---
{
  const w = 500, h = 380;
  const clean = makeScene(w, h);
  const marked = new Uint8ClampedArray(clean);
  // simulate a couple of "text strokes"
  const strokes = [[120, 200, 380, 205], [130, 230, 370, 232], [140, 258, 360, 260]];
  for (const [ax, ay, bx, by] of strokes) {
    const steps = Math.max(Math.abs(bx - ax), Math.abs(by - ay));
    for (let s = 0; s <= steps; s++) {
      const x = Math.round(ax + (bx - ax) * s / steps), y = Math.round(ay + (by - ay) * s / steps);
      for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
        if (dx * dx + dy * dy > 9) continue;
        const px = x + dx, py = y + dy;
        if (px < 0 || py < 0 || px >= w || py >= h) continue;
        const i = (py * w + px) * 4;
        marked[i] = marked[i] * 0.35 + 255 * 0.65;
        marked[i + 1] = marked[i + 1] * 0.35 + 255 * 0.65;
        marked[i + 2] = marked[i + 2] * 0.35 + 255 * 0.65;
      }
    }
  }
  // brush-like mask: discs along the strokes
  const mask = new Uint8Array(w * h);
  for (const [ax, ay, bx, by] of strokes) {
    const steps = Math.max(Math.abs(bx - ax), Math.abs(by - ay));
    for (let s = 0; s <= steps; s++) {
      const x = Math.round(ax + (bx - ax) * s / steps), y = Math.round(ay + (by - ay) * s / steps);
      for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) {
        if (dx * dx + dy * dy > 36) continue;
        const px = x + dx, py = y + dy;
        if (px < 0 || py < 0 || px >= w || py >= h) continue;
        mask[py * w + px] = 255;
      }
    }
  }
  for (const method of [0, 1, 2]) {
    const test = new Uint8ClampedArray(marked);
    const t0 = performance.now();
    inpaint(test, w, h, mask, method);
    const ms = performance.now() - t0;
    const p = psnr(test, clean);
    report(`method${method} thin strokes`,
      checkNoNaN(test) && p > 24,
      `psnr=${p.toFixed(1)} dB, ${ms.toFixed(0)} ms`);
  }
}
// --- test 3: mask touching image border (must not crash / misbehave) ---
{
  const w = 320, h = 240;
  const clean = makeScene(w, h);
  const marked = new Uint8ClampedArray(clean);
  stampRect(marked, w, h, 0, 0, 80, 60, 0.8);
  const mask = maskRect(w, h, 0, 0, 80, 60);
  for (const method of [0, 1, 2]) {
    const test = new Uint8ClampedArray(marked);
    const okRun = (() => { try { inpaint(test, w, h, mask, method); return true; } catch (e) { console.error(e); return false; } })();
    report(`method${method} border mask`, okRun && checkNoNaN(test));
  }
}
// --- test 4: perf on realistic watermark strip over a 4000x2500 image ---
{
  const w = 4000, h = 2500;
  const t0 = performance.now();
  const marked = makeScene(w, h);
  stampRect(marked, w, h, 100, 2150, 3900, 2350, 0.6); // 3800x200 strip
  const mask = maskRect(w, h, 95, 2145, 3905, 2355);
  const build = performance.now() - t0;
  const test = marked;
  const t1 = performance.now();
  inpaint(test, w, h, mask, 1);
  const ms = performance.now() - t1;
  report('method1 big strip 10MP', checkNoNaN(test) && ms < 15000, `mask 3810×210, ${ms.toFixed(0)} ms (scene build ${build.toFixed(0)} ms)`);
}
// --- test 5: empty mask / whole-image mask ---
{
  const w = 100, h = 80;
  const scene = makeScene(w, h);
  const empty = new Uint8Array(w * h);
  const a = new Uint8ClampedArray(scene);
  report('empty mask no-op', inpaint(a, w, h, empty, 1) === 0);
  const full = new Uint8Array(w * h).fill(255);
  const b = new Uint8ClampedArray(scene);
  let ok = true;
  try { inpaint(b, w, h, full, 1); } catch (e) { ok = false; console.error(e); }
  report('full-image mask runs', ok && checkNoNaN(b));
}

// --- test 6: ZIP writer (extracted from the module script) ---
{
  const zipStart = html.indexOf('/* ---- store-only ZIP writer');
  const zipEnd = html.indexOf('/* ================= controls wiring');
  const zipSrc = html.slice(zipStart, zipEnd);
  const { makeZip, crc32 } = new Function(zipSrc + '\nreturn { makeZip, crc32 };')();
  report('crc32 known vector', crc32(new TextEncoder().encode('123456789')) === 0xCBF43926, 'expect 0xCBF43926');
  const files = [
    { name: 'a-markgone.jpg', data: new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 1, 2, 3, 4, 5]) },
    { name: '测试-图片-markgone.png', data: new Uint8Array(1000).fill(7) },
  ];
  const blob = makeZip(files);
  const buf = Buffer.from(await blob.arrayBuffer());
  writeFileSync('/tmp/mg-test.zip', buf);
  console.log('INFO  zip written to /tmp/mg-test.zip (' + buf.length + ' bytes) — verify with python zipfile');
}

console.log(failed ? `\n${failed} FAILURE(S)` : '\nALL PASS');
process.exit(failed ? 1 : 0);
