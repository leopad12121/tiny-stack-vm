// Tiny stack VM (ISA v1) for make.fun tiny-stack-vm-01-run-20261122:
// 32-bit wrapping ints, 256-value data stack, 64-deep call stack, 256
// words of memory, IN/PRINT/PUTC I/O, ten traps, 1M-step and 64K-byte
// output limits. Answers every instance under the input dir.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const I = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const O = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
function run(p, g) {
  const s = new Int32Array(256), m = new Int32Array(256), c = new Int32Array(64);
  const o = new Uint8Array(65536);
  let sp = 0, cp = 0, pc = 0, t = 0, ip = 0, l = 0;
  const n = p.length;
  const done = (e) => [o.subarray(0, l), e];
  while (true) {
    if (t >= 1e6) return done(10);
    if (pc < 0 || pc >= n) return done(9);
    const k = p[pc];
    if (!(k <= 7 || (k >= 16 && k <= 34) || (k >= 48 && k <= 52) || (k >= 64 && k <= 65) || (k >= 80 && k <= 83))) return done(5);
    const z = k == 1 ? 1 : k == 2 ? 4 : k >= 48 && k <= 51 ? 2 : 0;
    if (pc + z >= n) return done(9);
    t++;
    let q = 0, w = 0;
    if (k == 3 || k == 4 || k == 23 || k == 27 || k == 49 || k == 50 || k == 64 || k == 80 || k == 81 || k == 83) { q = 1; w = k == 4 ? 2 : k == 64 ? 1 : 0; }
    else if (k == 5 || k == 6 || (k >= 16 && k <= 22) || (k >= 24 && k <= 34) || k == 65) { q = 2; w = k == 5 ? 2 : k == 6 ? 3 : k == 65 ? 0 : 1; }
    else if (k == 7) { q = 3; w = 3; }
    else if (k == 1 || k == 2 || k == 82) w = 1;
    if (sp < q) return done(2);
    if (sp - q + w > 256) return done(3);
    const x = pc + 1 + z;
    pc = x;
    const b = s[sp - 1], a = s[sp - 2];
    const j = () => ((p[x - 2] | (p[x - 1] << 8)) << 16) >> 16;
    switch (k) {
      case 0: return done(0);
      case 1: s[sp++] = (p[x - 1] << 24) >> 24; break;
      case 2: s[sp++] = p[x - 4] | (p[x - 3] << 8) | (p[x - 2] << 16) | (p[x - 1] << 24); break;
      case 3: sp--; break;
      case 4: s[sp] = s[sp - 1]; sp++; break;
      case 5: { const v = s[sp - 1]; s[sp - 1] = s[sp - 2]; s[sp - 2] = v; break; }
      case 6: s[sp] = s[sp - 2]; sp++; break;
      case 7: { const v = s[sp - 3]; s[sp - 3] = s[sp - 2]; s[sp - 2] = s[sp - 1]; s[sp - 1] = v; break; }
      case 16: sp--; s[sp - 1] = (a + b) | 0; break;
      case 17: sp--; s[sp - 1] = (a - b) | 0; break;
      case 18: sp--; s[sp - 1] = Math.imul(a, b); break;
      case 19: if (!b) return done(4); sp--; s[sp - 1] = Math.trunc(a / b) | 0; break;
      case 20: if (!b) return done(4); sp--; s[sp - 1] = (a % b) | 0; break;
      case 21: if (!b) return done(4); sp--; s[sp - 1] = ((a >>> 0) / (b >>> 0)) | 0; break;
      case 22: if (!b) return done(4); sp--; s[sp - 1] = ((a >>> 0) % (b >>> 0)) | 0; break;
      case 23: s[sp - 1] = (-s[sp - 1]) | 0; break;
      case 24: sp--; s[sp - 1] = a & b; break;
      case 25: sp--; s[sp - 1] = a | b; break;
      case 26: sp--; s[sp - 1] = a ^ b; break;
      case 27: s[sp - 1] = ~s[sp - 1]; break;
      case 28: sp--; s[sp - 1] = a << (b & 31); break;
      case 29: sp--; s[sp - 1] = a >> (b & 31); break;
      case 30: sp--; s[sp - 1] = (a >>> (b & 31)) | 0; break;
      case 32: sp--; s[sp - 1] = a === b ? 1 : 0; break;
      case 33: sp--; s[sp - 1] = a < b ? 1 : 0; break;
      case 34: sp--; s[sp - 1] = (a >>> 0) < (b >>> 0) ? 1 : 0; break;
      case 48: pc = x + j(); break;
      case 49: sp--; if (!b) pc = x + j(); break;
      case 50: sp--; if (b) pc = x + j(); break;
      case 51: if (cp >= 64) return done(7); c[cp++] = x; pc = p[x - 2] | (p[x - 1] << 8); break;
      case 52: if (!cp) return done(8); pc = c[--cp]; break;
      case 64: { const d = s[sp - 1]; if (d < 0 || d > 255) return done(6); s[sp - 1] = m[d]; break; }
      case 65: { const d = s[sp - 1]; if (d < 0 || d > 255) return done(6); m[d] = s[sp - 2]; sp -= 2; break; }
      case 80: { const v = s[--sp], y = String(v); if (l + y.length > 65536) return done(11); for (let i = 0; i < y.length; i++) o[l++] = y.charCodeAt(i); break; }
      case 81: { const v = s[--sp]; if (l >= 65536) return done(11); o[l++] = v & 255; break; }
      case 82: s[sp++] = ip < g.length ? g[ip++] : -1; break;
      case 83: return done(s[--sp] & 255);
    }
  }
}
for (const d of readdirSync(I).sort()) {
  let p;
  try { p = readFileSync(join(I, d, 'program.bin')); } catch { continue; }
  let g;
  try { g = readFileSync(join(I, d, 'input.bin')); } catch { g = Buffer.alloc(0); }
  const r = run(p, g);
  mkdirSync(join(O, d), { recursive: true });
  writeFileSync(join(O, d, 'stdout.bin'), r[0]);
  writeFileSync(join(O, d, 'exit.txt'), r[1] + '\n');
}
