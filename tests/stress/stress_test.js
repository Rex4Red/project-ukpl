/**
 * MedDose — Custom Stress Test Script (Zero-Dependency)
 * Cara pakai:
 *   1. node server.js
 *   2. node tests/stress/stress_test.js
 *
 * Penulis: Putra (Stress Testing)
 */

const http = require('http');
const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

const ENDPOINT = '/api/calculate';

const TEST_LEVELS = [
  { name: 'Baseline',  concurrent:   1, total:   20, desc: '1 user (baseline)' },
  { name: 'Normal',    concurrent:  10, total:  100, desc: '10 users (klinik kecil)' },
  { name: 'Peak',      concurrent:  50, total:  300, desc: '50 users (jam sibuk)' },
  { name: 'Stress',    concurrent: 100, total:  500, desc: '100 users (beban tinggi)' },
  { name: 'Heavy',     concurrent: 250, total: 1000, desc: '250 users (sangat tinggi)' },
  { name: 'Breaking',  concurrent: 500, total: 2000, desc: '500 users (cari titik crash)' },
];

const PAYLOADS = [
  { patientName:'Dewasa Normal', weight:70, age:30, ageCategory:'dewasa', drugId:'paracetamol', frequency:6, conditions:[], interactingDrug:'none' },
  { patientName:'Anak', weight:25, age:8, ageCategory:'anak', drugId:'amoxicillin', frequency:8, conditions:[], interactingDrug:'none' },
  { patientName:'Lansia Ginjal', weight:60, age:72, ageCategory:'lansia', drugId:'paracetamol', frequency:8, conditions:['gangguanGinjal'], interactingDrug:'warfarin' },
  { patientName:'Remaja', weight:55, age:15, ageCategory:'remaja', drugId:'ibuprofen', frequency:6, conditions:[], interactingDrug:'none' },
  { patientName:'Diabetes', weight:85, age:45, ageCategory:'dewasa', drugId:'metformin', frequency:12, conditions:[], interactingDrug:'alcohol' },
  { patientName:'Alergi', weight:65, age:28, ageCategory:'dewasa', drugId:'cetirizine', frequency:24, conditions:[], interactingDrug:'none' },
  { patientName:'Hamil', weight:62, age:29, ageCategory:'dewasa', drugId:'paracetamol', frequency:6, conditions:['hamil'], interactingDrug:'none' },
  { patientName:'Bayi', weight:5, age:0.5, ageCategory:'bayi', drugId:'paracetamol', frequency:6, conditions:[], interactingDrug:'none' },
];

function randomPayload() {
  return PAYLOADS[Math.floor(Math.random() * PAYLOADS.length)];
}

function pctl(sorted, p) {
  if (!sorted.length) return 0;
  return sorted[Math.max(0, Math.ceil((p / 100) * sorted.length) - 1)];
}

function sendReq() {
  return new Promise((resolve) => {
    const body = JSON.stringify(randomPayload());
    const t0 = performance.now();
    const opts = {
      hostname: 'localhost', port: 3000, path: ENDPOINT, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      timeout: 10000,
    };
    const req = http.request(opts, (res) => {
      let d = '';
      res.on('data', (c) => { d += c; });
      res.on('end', () => {
        const ms = performance.now() - t0;
        let ok = false;
        try { ok = res.statusCode === 200 && JSON.parse(d).success === true; } catch (_) {}
        resolve({ ms, status: res.statusCode, ok, err: null });
      });
    });
    req.on('error', (e) => resolve({ ms: performance.now() - t0, status: 0, ok: false, err: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ ms: performance.now() - t0, status: 0, ok: false, err: 'TIMEOUT' }); });
    req.write(body);
    req.end();
  });
}

async function runBatch(concurrent, total) {
  const results = [];
  let done = 0, flying = 0;
  return new Promise((resolve) => {
    function next() {
      while (flying < concurrent && done + flying < total) {
        flying++;
        sendReq().then((r) => {
          results.push(r);
          flying--; done++;
          const pct = Math.floor((done / total) * 100);
          if (done % Math.max(1, Math.floor(total / 10)) === 0)
            process.stdout.write(`\r    Progress: ${pct}% (${done}/${total})`);
          if (done >= total) { process.stdout.write(`\r    Progress: 100% (${done}/${total})\n`); resolve(results); }
          else next();
        });
      }
    }
    next();
  });
}

function analyze(results) {
  const durs = results.map((r) => r.ms).sort((a, b) => a - b);
  const ok = results.filter((r) => r.ok).length;
  const fail = results.length - ok;
  const sum = durs.reduce((s, d) => s + d, 0);
  return {
    total: results.length, success: ok, failed: fail,
    errorRate: (fail / results.length) * 100,
    avg: sum / durs.length, min: durs[0] || 0, max: durs[durs.length - 1] || 0,
    p50: pctl(durs, 50), p95: pctl(durs, 95), p99: pctl(durs, 99),
    rps: results.length / (sum / 1000) * (results.length > 0 ? 1 : 0),
  };
}

async function main() {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        💊 MedDose — Stress Test Report                    ║');
  console.log('║        Endpoint: POST /api/calculate                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`  Waktu  : ${new Date().toLocaleString('id-ID')}`);
  console.log(`  Payload: ${PAYLOADS.length} variasi | Levels: ${TEST_LEVELS.length}`);
  console.log('');

  // Cek server
  try {
    await new Promise((ok, fail) => {
      const r = http.get('http://localhost:3000/api/calculate', (res) => { res.on('data', () => {}); res.on('end', ok); });
      r.on('error', fail); r.setTimeout(3000, () => { r.destroy(); fail(new Error('timeout')); });
    });
    console.log('  ✅ Server aktif\n');
  } catch (_) {
    console.log('  ❌ Server tidak aktif! Jalankan: node server.js\n');
    process.exit(1);
  }

  const all = [];
  let breakAt = null;

  for (let i = 0; i < TEST_LEVELS.length; i++) {
    const lv = TEST_LEVELS[i];
    console.log(`  ┌─ [${i + 1}/${TEST_LEVELS.length}] ${lv.name} — ${lv.desc}`);
    console.log(`  │  Concurrent: ${lv.concurrent} | Requests: ${lv.total}`);

    const t0 = performance.now();
    const res = await runBatch(lv.concurrent, lv.total);
    const elapsed = ((performance.now() - t0) / 1000).toFixed(1);
    const s = analyze(res);

    const icon = s.errorRate > 10 ? '🔴' : s.errorRate > 5 ? '🟠' : s.errorRate > 1 ? '🟡' : '🟢';
    console.log(`  │  ${elapsed}s | Avg: ${s.avg.toFixed(1)}ms | p95: ${s.p95.toFixed(1)}ms | Max: ${s.max.toFixed(1)}ms`);
    console.log(`  │  Throughput: ${s.rps.toFixed(0)} req/s | Errors: ${s.failed} (${s.errorRate.toFixed(1)}%) ${icon}`);

    if (s.errorRate > 10 && !breakAt) {
      breakAt = lv.name;
      console.log(`  │  ⚠️  BREAKING POINT`);
    }
    console.log('  └──────────────────────────────────────');
    console.log('');

    all.push({ level: lv.name, concurrent: lv.concurrent, elapsed: parseFloat(elapsed), ...s });

    if (i < TEST_LEVELS.length - 1) await new Promise((r) => setTimeout(r, 2000));
  }

  // Ringkasan tabel
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                     📊 RINGKASAN STRESS TEST                              ║');
  console.log('╠═══════════╤═══════╤════════╤═════════╤═════════╤═════════╤════════╤════════╣');
  console.log('║ Level     │ Users │ Req/s  │ Avg(ms) │ p95(ms) │ Max(ms) │ Error% │ Status ║');
  console.log('╠═══════════╪═══════╪════════╪═════════╪═════════╪═════════╪════════╪════════╣');
  all.forEach((r) => {
    const st = r.errorRate > 10 ? '🔴FAIL' : r.errorRate > 5 ? '🟠WARN' : r.errorRate > 1 ? '🟡ATTN' : '🟢 OK ';
    console.log(`║ ${r.level.padEnd(9)} │ ${String(r.concurrent).padStart(5)} │ ${String(r.rps.toFixed(0)).padStart(6)} │ ${r.avg.toFixed(1).padStart(7)} │ ${r.p95.toFixed(1).padStart(7)} │ ${r.max.toFixed(1).padStart(7)} │ ${r.errorRate.toFixed(1).padStart(5)}% │ ${st} ║`);
  });
  console.log('╚═══════════╧═══════╧════════╧═════════╧═════════╧═════════╧════════╧════════╝');

  // Analisis
  const baseAvg = all[0]?.avg || 1;
  const degradeAt = all.find((r) => r.avg > baseAvg * 3);
  console.log('\n📝 ANALISIS:');
  console.log(`  Baseline avg response time : ${baseAvg.toFixed(1)}ms`);
  console.log(`  Max throughput             : ${Math.max(...all.map(r => r.rps)).toFixed(0)} req/s`);
  if (degradeAt) console.log(`  Degradasi dimulai pada     : ${degradeAt.level} (avg > ${(baseAvg * 3).toFixed(0)}ms)`);
  if (breakAt)   console.log(`  Breaking point             : ${breakAt} (error rate > 10%)`);
  else           console.log(`  Breaking point             : Tidak ditemukan (server stabil)`);

  // Simpan JSON
  const out = path.join(__dirname, 'results.json');
  fs.writeFileSync(out, JSON.stringify({ timestamp: new Date().toISOString(), results: all, breakingPoint: breakAt, degradation: degradeAt?.level || null }, null, 2));
  console.log(`\n  💾 Data disimpan: ${out}`);
  console.log('  Selanjutnya validasi dengan k6:');
  console.log('  → k6 run tests/stress/k6_stress_test.js --out web-dashboard\n');
}

main().catch(console.error);
