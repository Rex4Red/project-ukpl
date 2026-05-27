/**
 * MedDose — k6 Stress Test Script
 * ================================
 * Jalankan dengan web dashboard untuk visualisasi real-time:
 *   k6 run tests/stress/k6_stress_test.js --out web-dashboard
 *
 * Atau tanpa dashboard:
 *   k6 run tests/stress/k6_stress_test.js
 *
 * Install k6:
 *   - Windows: choco install k6  ATAU  winget install grafana.k6
 *   - Atau download dari: https://k6.io/docs/get-started/installation/
 *
 * Penulis: Putra (Stress Testing)
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ==================== CUSTOM METRICS ====================
const errorRate = new Rate('meddose_errors');
const responseTrend = new Trend('meddose_response_time');

// ==================== KONFIGURASI SKENARIO ====================
// Simulasi beban bertahap: naik → puncak → turun
export const options = {
  scenarios: {
    // Skenario 1: Ramp-up bertahap (utama)
    ramp_up: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '15s', target: 10 },   // Warm up: 0 → 10 users
        { duration: '30s', target: 10 },   // Normal: tetap 10 users
        { duration: '15s', target: 50 },   // Naik: 10 → 50 users
        { duration: '30s', target: 50 },   // Peak: tetap 50 users
        { duration: '15s', target: 100 },  // Naik: 50 → 100 users
        { duration: '30s', target: 100 },  // Stress: tetap 100 users
        { duration: '15s', target: 250 },  // Naik: 100 → 250 users
        { duration: '30s', target: 250 },  // Heavy: tetap 250 users
        { duration: '15s', target: 0 },    // Cool down: 250 → 0
      ],
      gracefulRampDown: '10s',
    },

    // Skenario 2: Spike test (lonjakan mendadak)
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      startTime: '210s', // mulai setelah skenario 1 selesai
      stages: [
        { duration: '5s',  target: 500 },  // Lonjakan mendadak ke 500
        { duration: '30s', target: 500 },  // Tahan 500 users
        { duration: '10s', target: 0 },    // Turun
      ],
      gracefulRampDown: '5s',
    },
  },

  // Threshold: batas performa yang diharapkan
  thresholds: {
    http_req_duration: [
      'p(95)<500',  // 95% request harus di bawah 500ms
      'p(99)<1000', // 99% request harus di bawah 1000ms
    ],
    meddose_errors: ['rate<0.1'], // Error rate harus di bawah 10%
    http_req_failed: ['rate<0.1'],
  },
};

// ==================== DATA PASIEN (VARIASI) ====================
const patients = [
  { patientName:'Dewasa Normal', weight:70, age:30, ageCategory:'dewasa', drugId:'paracetamol', frequency:6, conditions:[], interactingDrug:'none' },
  { patientName:'Anak Kecil', weight:25, age:8, ageCategory:'anak', drugId:'amoxicillin', frequency:8, conditions:[], interactingDrug:'none' },
  { patientName:'Lansia Ginjal', weight:60, age:72, ageCategory:'lansia', drugId:'paracetamol', frequency:8, conditions:['gangguanGinjal'], interactingDrug:'warfarin' },
  { patientName:'Remaja Sehat', weight:55, age:15, ageCategory:'remaja', drugId:'ibuprofen', frequency:6, conditions:[], interactingDrug:'none' },
  { patientName:'Pria Diabetes', weight:85, age:45, ageCategory:'dewasa', drugId:'metformin', frequency:12, conditions:[], interactingDrug:'alcohol' },
  { patientName:'Wanita Alergi', weight:65, age:28, ageCategory:'dewasa', drugId:'cetirizine', frequency:24, conditions:[], interactingDrug:'none' },
  { patientName:'Ibu Hamil', weight:62, age:29, ageCategory:'dewasa', drugId:'paracetamol', frequency:6, conditions:['hamil'], interactingDrug:'none' },
  { patientName:'Bayi 6 Bulan', weight:5, age:0.5, ageCategory:'bayi', drugId:'paracetamol', frequency:6, conditions:[], interactingDrug:'none' },
];

// ==================== FUNGSI TEST UTAMA ====================
export default function () {
  // Pilih data pasien secara acak
  const patient = patients[Math.floor(Math.random() * patients.length)];

  const res = http.post(
    'http://localhost:3000/api/calculate',
    JSON.stringify(patient),
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: '10s',
    }
  );

  // Catat metrik custom
  responseTrend.add(res.timings.duration);

  // Validasi response
  const passed = check(res, {
    'status 200': (r) => r.status === 200,
    'response valid JSON': (r) => {
      try { JSON.parse(r.body); return true; } catch (_) { return false; }
    },
    'calculation success': (r) => {
      try { return JSON.parse(r.body).success === true; } catch (_) { return false; }
    },
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  errorRate.add(!passed);

  // Jeda singkat antar request (simulasi user nyata)
  sleep(0.1);
}

// ==================== SUMMARY HANDLER ====================
export function handleSummary(data) {
  const summary = {
    timestamp: new Date().toISOString(),
    tool: 'k6',
    metrics: {
      http_reqs: data.metrics.http_reqs?.values?.count || 0,
      avg_duration: data.metrics.http_req_duration?.values?.avg?.toFixed(2) || 0,
      p95_duration: data.metrics.http_req_duration?.values['p(95)']?.toFixed(2) || 0,
      p99_duration: data.metrics.http_req_duration?.values['p(99)']?.toFixed(2) || 0,
      max_duration: data.metrics.http_req_duration?.values?.max?.toFixed(2) || 0,
      error_rate: data.metrics.http_req_failed?.values?.rate?.toFixed(4) || 0,
    },
    thresholds_passed: Object.entries(data.metrics)
      .filter(([_, v]) => v.thresholds)
      .every(([_, v]) => Object.values(v.thresholds).every(t => t.ok)),
  };

  return {
    'tests/stress/k6_results.json': JSON.stringify(summary, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

// k6 built-in text summary
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.3/index.js';
