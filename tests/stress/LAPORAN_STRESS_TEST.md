# 📊 Laporan Stress Testing — MedDose

**Penguji:** Putra (Stress Testing)  
**Tanggal:** 27 Mei 2026  
**Aplikasi:** MedDose — Kalkulator Dosis Obat  
**Endpoint:** `POST /api/calculate`  
**Lingkungan:** Node.js v20.x, localhost, single-threaded server  

---

## 1. Tujuan Pengujian

Sesuai requirement dari PROJECT UKPL:
1. **Memberikan beban input data dalam jumlah besar secara simultan**
2. **Mengukur kecepatan respon sistem saat beban meningkat**
3. **Menentukan pada titik mana fitur tersebut mengalami kegagalan atau crash**

---

## 2. Metodologi

### 2.1 Tools yang Digunakan

| Tool | Fungsi | Keterangan |
|------|--------|------------|
| **Script Custom Node.js** (`stress_test.js`) | Pengujian bertahap 6 level | Zero-dependency, bisa dijelaskan logikanya |
| **Grafana k6** (`k6_stress_test.js`) | Validasi + dashboard visual | Tool standar industri, web dashboard real-time |

### 2.2 Payload Variasi

Digunakan **8 variasi data pasien** yang berbeda untuk simulasi realistis:

| # | Pasien | BB (kg) | Usia | Obat | Kondisi Khusus |
|---|--------|---------|------|------|----------------|
| 1 | Dewasa Normal | 70 | 30 | Paracetamol | - |
| 2 | Anak | 25 | 8 | Amoxicillin | - |
| 3 | Lansia Ginjal | 60 | 72 | Paracetamol | Gangguan Ginjal + Warfarin |
| 4 | Remaja | 55 | 15 | Ibuprofen | - |
| 5 | Diabetes | 85 | 45 | Metformin | Alkohol |
| 6 | Alergi | 65 | 28 | Cetirizine | - |
| 7 | Hamil | 62 | 29 | Paracetamol | Kehamilan |
| 8 | Bayi | 5 | 0.5 | Paracetamol | - |

---

## 3. Hasil Pengujian — Script Custom

### 3.1 Tabel Ringkasan

| Level | Concurrent Users | Total Request | Avg (ms) | p50 (ms) | p95 (ms) | Max (ms) | Throughput (req/s) | Error Rate | Status |
|-------|-----------------|---------------|----------|----------|----------|----------|-------------------|------------|--------|
| **Baseline** | 1 | 20 | **0.5** | 0.4 | 0.8 | 1.7 | 1,846 | 0.0% | 🟢 OK |
| **Normal** | 10 | 100 | **2.0** | 1.6 | 4.9 | 5.3 | 493 | 0.0% | 🟢 OK |
| **Peak** | 50 | 300 | **8.8** | 7.5 | 17.9 | 20.4 | 114 | 0.0% | 🟢 OK |
| **Stress** | 100 | 500 | **13.9** | 12.1 | 33.7 | 37.3 | 72 | 0.0% | 🟢 OK |
| **Heavy** | 250 | 1,000 | **40.4** | 36.6 | 88.4 | 93.6 | 25 | 0.0% | 🟢 OK |
| **Breaking** | 500 | 2,000 | **81.4** | 75.3 | 173.7 | 201.8 | 12 | 0.0% | 🟢 OK |

### 3.2 Analisis Tren Performa

```
Response Time (ms) vs Concurrent Users
│
│                                                    ╭── 81.4ms
│                                               ╭───╯
│                                          ╭───╯
│                                     ╭───╯  40.4ms
│                                ╭───╯
│                           ╭───╯
│                      ╭───╯  13.9ms
│                 ╭───╯
│            ╭───╯  8.8ms
│       ╭───╯
│  ╭───╯  2.0ms
│──╯ 0.5ms
└──────────────────────────────────────────── Concurrent Users
   1      10      50     100     250     500
```

**Pola yang terlihat:**
- Response time naik **linear** hingga 100 users
- Mulai **eksponensial** dari 250+ users
- Throughput turun dari 1,846 req/s (1 user) ke 12 req/s (500 users)

---

## 4. Hasil Pengujian — k6 (Validasi)

### 4.1 Konfigurasi Skenario

**Skenario 1 — Ramp-up Bertahap (3 menit 15 detik):**
```
0→10 VUs (15s) → 10 VUs tetap (30s) → 10→50 VUs (15s) → 50 VUs tetap (30s)
→ 50→100 VUs (15s) → 100 VUs tetap (30s) → 100→250 VUs (15s)
→ 250 VUs tetap (30s) → cool down (15s)
```

**Skenario 2 — Spike Test (45 detik):**
```
0→500 VUs (5s) → 500 VUs tetap (30s) → cool down (10s)
```

### 4.2 Hasil k6

| Metrik | Nilai |
|--------|-------|
| **Total Requests** | 369,100 |
| **Total Duration** | 4 menit 15 detik |
| **Avg Request Rate** | 4,350 req/s |
| **Avg Response Time** | 392 μs (0.39 ms) |
| **p90 Response Time** | 1 ms |
| **p95 Response Time** | 1 ms |
| **p99 Response Time** | 3 ms |
| **Max Response Time** | 19 ms |
| **Error Rate** | **0.0%** |
| **HTTP Request Failed** | **0.0%** |
| **Checks Passed** | **100%** |
| **Max VUs** | 500 |
| **Data Received** | 365 MB (1.43 MB/s) |
| **Data Sent** | 108 MB (422 kB/s) |

### 4.3 Threshold Results

| Threshold | Target | Actual | Status |
|-----------|--------|--------|--------|
| p(95) < 500ms | < 500ms | **1ms** | ✅ PASS |
| p(99) < 1000ms | < 1000ms | **3ms** | ✅ PASS |
| Error rate < 10% | < 10% | **0.0%** | ✅ PASS |
| MedDose errors < 10% | < 10% | **0.0%** | ✅ PASS |

### 4.4 Screenshot Dashboard k6

*Dashboard real-time saat test berjalan:*
- File: `screenshots/k6_realtime.png`

*Dashboard overview setelah test selesai:*
- File: `screenshots/k6_overview.png`

*Summary metrics:*
- File: `screenshots/k6_summary.png`

---

## 5. Analisis & Temuan

### 5.1 Breaking Point

> **Temuan: Server MedDose TIDAK mencapai breaking point pada 500 concurrent users.**

Server berhasil menangani semua level beban tanpa error. Ini karena:
1. **Logika perhitungan ringan** — operasi aritmatika murni, tidak ada I/O database
2. **Tidak ada operasi async blocking** — semua sinkron dalam event loop
3. **Payload kecil** — request/response dalam ukuran kilobyte

### 5.2 Degradasi Performa

| Indikator | Level Degradasi | Keterangan |
|-----------|----------------|------------|
| Response time > 3x baseline | **Normal (10 users)** | Avg naik dari 0.5ms → 2.0ms (4x) |
| Response time > 50ms | **Heavy (250 users)** | Avg 40.4ms, p95 88.4ms |
| Response time > 100ms | **Breaking (500 users)** | Avg 81.4ms, p95 173.7ms |
| Throughput drop > 90% | **Peak (50 users)** | Turun dari 1,846 ke 114 req/s |

### 5.3 Kapasitas Operasional

| Kategori | Max Concurrent | Response Time | Keterangan |
|----------|---------------|---------------|------------|
| **Ideal** | ≤ 10 users | < 5ms | Klinik kecil, penggunaan normal |
| **Dapat Diterima** | ≤ 100 users | < 40ms | Rumah sakit menengah |
| **Batas Atas** | ≤ 250 users | < 100ms | Mendekati batas, perlu monitoring |
| **Tidak Direkomendasikan** | > 250 users | > 100ms | Perlu horizontal scaling |

### 5.4 Rekomendasi Peningkatan

Jika dibutuhkan kapasitas lebih tinggi, pertimbangkan:

1. **Clustering** — Gunakan `cluster` module Node.js untuk multi-core
2. **Load Balancer** — Nginx/HAProxy di depan beberapa instance
3. **Caching** — Cache hasil perhitungan untuk payload identik
4. **Rate Limiting** — Batasi request per IP untuk mencegah abuse

---

## 6. Perbandingan Hasil Custom Script vs k6

| Aspek | Custom Script | k6 |
|-------|--------------|-----|
| Total requests | 3,920 | 369,100 |
| Avg response time | Bervariasi per level | 0.39ms (keseluruhan) |
| Error rate | 0.0% | 0.0% |
| Max VUs | 500 | 500 |
| Kelebihan | Detail per level, logika transparan | Dashboard visual, standar industri |
| Kekurangan | Output terminal saja | Butuh install k6 |

**Kesimpulan:** Kedua tool mengkonfirmasi bahwa server MedDose **stabil dan handal** pada semua level beban hingga 500 concurrent users.

---

## 7. File Pendukung

| File | Deskripsi |
|------|-----------|
| `stress_test.js` | Script custom Node.js (zero-dependency) |
| `k6_stress_test.js` | Script k6 dengan 2 skenario |
| `results.json` | Data mentah hasil custom script |
| `screenshots/k6_realtime.png` | Screenshot dashboard k6 (real-time) |
| `screenshots/k6_overview.png` | Screenshot dashboard k6 (overview) |
| `screenshots/k6_summary.png` | Screenshot dashboard k6 (summary) |

---

*Laporan ini dibuat sebagai bagian dari tugas akhir mata kuliah Uji Kualitas Perangkat Lunak (UKPL).*
