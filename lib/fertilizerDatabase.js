/**
 * FertiliCalc — Database Pupuk & Tanaman
 * ========================================
 * Berisi data pupuk, tanaman, dosis rekomendasi,
 * kondisi khusus, dan interaksi antar pupuk.
 */

const fertilizerDatabase = {
  // ==================== DATA PUPUK ====================
  fertilizers: {
    urea: {
      id: 'urea',
      name: 'Urea (46% N)',
      type: 'Nitrogen',
      nutrient: 'N',
      concentration: 46, // persen kandungan hara
      unit: 'kg',
      description: 'Pupuk nitrogen utama untuk pertumbuhan vegetatif',
      allowedPhases: ['vegetatif', 'generatif'],
      phRange: { min: 5.5, max: 7.5 },
      maxPerHectare: 300, // kg/ha max
      pricePerKg: 12000,
    },
    npk_15: {
      id: 'npk_15',
      name: 'NPK Phonska (15-15-15)',
      type: 'Majemuk',
      nutrient: 'NPK',
      concentration: 45,
      unit: 'kg',
      description: 'Pupuk majemuk seimbang N-P-K',
      allowedPhases: ['semai', 'vegetatif', 'generatif', 'panen'],
      phRange: { min: 5.0, max: 8.0 },
      maxPerHectare: 400,
      pricePerKg: 15000,
    },
    kcl: {
      id: 'kcl',
      name: 'KCl (60% K₂O)',
      type: 'Kalium',
      nutrient: 'K',
      concentration: 60,
      unit: 'kg',
      description: 'Pupuk kalium untuk kualitas buah dan ketahanan penyakit',
      allowedPhases: ['generatif', 'panen'],
      phRange: { min: 5.0, max: 7.0 },
      maxPerHectare: 200,
      pricePerKg: 14000,
    },
    sp36: {
      id: 'sp36',
      name: 'SP-36 (36% P₂O₅)',
      type: 'Fosfor',
      nutrient: 'P',
      concentration: 36,
      unit: 'kg',
      description: 'Pupuk fosfor untuk perakaran dan pembungaan',
      allowedPhases: ['semai', 'vegetatif', 'generatif'],
      phRange: { min: 5.5, max: 7.0 },
      maxPerHectare: 250,
      pricePerKg: 11000,
    },
    za: {
      id: 'za',
      name: 'ZA / Amonium Sulfat (21% N)',
      type: 'Nitrogen-Sulfur',
      nutrient: 'NS',
      concentration: 21,
      unit: 'kg',
      description: 'Pupuk nitrogen + sulfur, cocok untuk tanah basa',
      allowedPhases: ['vegetatif', 'generatif'],
      phRange: { min: 6.0, max: 8.5 },
      maxPerHectare: 350,
      pricePerKg: 9000,
    },
    organik: {
      id: 'organik',
      name: 'Pupuk Organik / Kompos',
      type: 'Organik',
      nutrient: 'Multi',
      concentration: 5,
      unit: 'kg',
      description: 'Pupuk organik untuk memperbaiki struktur tanah',
      allowedPhases: ['semai', 'vegetatif', 'generatif', 'panen'],
      phRange: { min: 4.0, max: 9.0 },
      maxPerHectare: 5000,
      pricePerKg: 3000,
    },
  },

  // ==================== DATA TANAMAN ====================
  plants: {
    padi: {
      id: 'padi',
      name: 'Padi',
      category: 'Pangan',
      growthDays: 120,
      phases: {
        semai:     { startDay: 0,  endDay: 20,  label: 'Persemaian' },
        vegetatif: { startDay: 21, endDay: 60,  label: 'Vegetatif (Anakan)' },
        generatif: { startDay: 61, endDay: 100, label: 'Generatif (Berbunga)' },
        panen:     { startDay: 101, endDay: 120, label: 'Pematangan & Panen' },
      },
      // Dosis dasar per hektar (kg/ha) per jenis pupuk
      baseDose: {
        urea: 200, npk_15: 300, kcl: 100, sp36: 150, za: 200, organik: 2000,
      },
      optimalPh: { min: 5.5, max: 7.0 },
    },
    jagung: {
      id: 'jagung',
      name: 'Jagung',
      category: 'Pangan',
      growthDays: 100,
      phases: {
        semai:     { startDay: 0,  endDay: 14,  label: 'Perkecambahan' },
        vegetatif: { startDay: 15, endDay: 50,  label: 'Vegetatif' },
        generatif: { startDay: 51, endDay: 85,  label: 'Pembungaan & Pengisian' },
        panen:     { startDay: 86, endDay: 100, label: 'Pematangan' },
      },
      baseDose: {
        urea: 250, npk_15: 350, kcl: 75, sp36: 100, za: 150, organik: 1500,
      },
      optimalPh: { min: 5.8, max: 7.0 },
    },
    cabai: {
      id: 'cabai',
      name: 'Cabai Merah',
      category: 'Hortikultura',
      growthDays: 150,
      phases: {
        semai:     { startDay: 0,  endDay: 30,  label: 'Persemaian' },
        vegetatif: { startDay: 31, endDay: 70,  label: 'Pertumbuhan Batang' },
        generatif: { startDay: 71, endDay: 130, label: 'Berbunga & Berbuah' },
        panen:     { startDay: 131, endDay: 150, label: 'Panen' },
      },
      baseDose: {
        urea: 150, npk_15: 400, kcl: 150, sp36: 200, za: 100, organik: 3000,
      },
      optimalPh: { min: 6.0, max: 7.0 },
    },
    tomat: {
      id: 'tomat',
      name: 'Tomat',
      category: 'Hortikultura',
      growthDays: 120,
      phases: {
        semai:     { startDay: 0,  endDay: 25,  label: 'Persemaian' },
        vegetatif: { startDay: 26, endDay: 55,  label: 'Pertumbuhan Vegetatif' },
        generatif: { startDay: 56, endDay: 100, label: 'Berbunga & Berbuah' },
        panen:     { startDay: 101, endDay: 120, label: 'Panen' },
      },
      baseDose: {
        urea: 180, npk_15: 350, kcl: 120, sp36: 180, za: 120, organik: 2500,
      },
      optimalPh: { min: 6.0, max: 6.8 },
    },
    sawit: {
      id: 'sawit',
      name: 'Kelapa Sawit',
      category: 'Perkebunan',
      growthDays: 365,
      phases: {
        semai:     { startDay: 0,   endDay: 90,  label: 'Pembibitan' },
        vegetatif: { startDay: 91,  endDay: 200, label: 'TBM (Tanaman Belum Menghasilkan)' },
        generatif: { startDay: 201, endDay: 330, label: 'TM (Tanaman Menghasilkan)' },
        panen:     { startDay: 331, endDay: 365, label: 'Panen Tandan' },
      },
      baseDose: {
        urea: 250, npk_15: 500, kcl: 300, sp36: 200, za: 300, organik: 4000,
      },
      optimalPh: { min: 5.0, max: 6.5 },
    },
    bawang: {
      id: 'bawang',
      name: 'Bawang Merah',
      category: 'Hortikultura',
      growthDays: 70,
      phases: {
        semai:     { startDay: 0,  endDay: 10,  label: 'Penanaman Umbi' },
        vegetatif: { startDay: 11, endDay: 35,  label: 'Pertumbuhan Daun' },
        generatif: { startDay: 36, endDay: 60,  label: 'Pembentukan Umbi' },
        panen:     { startDay: 61, endDay: 70,  label: 'Panen' },
      },
      baseDose: {
        urea: 100, npk_15: 250, kcl: 100, sp36: 150, za: 80, organik: 2000,
      },
      optimalPh: { min: 5.5, max: 6.5 },
    },
  },

  // ==================== FAKTOR FASE PERTUMBUHAN ====================
  phaseFactors: {
    semai:     { N: 0.3, P: 0.5, K: 0.2, Multi: 0.4 },
    vegetatif: { N: 1.0, P: 0.7, K: 0.5, Multi: 0.8 },
    generatif: { N: 0.6, P: 1.0, K: 1.0, Multi: 1.0 },
    panen:     { N: 0.2, P: 0.3, K: 0.8, Multi: 0.5 },
  },

  // ==================== KONDISI KHUSUS ====================
  conditions: {
    tanahAsam: {
      id: 'tanahAsam',
      name: 'Tanah Sangat Asam (pH < 5)',
      adjustments: {
        urea:    { type: 'reduce', factor: 0.7, reason: 'Nitrogen mudah hilang di tanah asam' },
        sp36:    { type: 'reduce', factor: 0.5, reason: 'Fosfor terikat aluminium di pH rendah' },
        za:      { type: 'contraindicated', reason: 'ZA akan menurunkan pH lebih rendah' },
        organik: { type: 'increase', factor: 1.5, reason: 'Organik membantu buffer pH' },
        npk_15:  { type: 'caution', factor: 0.8, reason: 'Sesuaikan dengan kondisi pH' },
        kcl:     { type: 'safe', factor: 1.0, reason: 'KCl relatif aman di tanah asam' },
      },
    },
    kekeringan: {
      id: 'kekeringan',
      name: 'Musim Kemarau / Kekeringan',
      adjustments: {
        urea:    { type: 'reduce', factor: 0.5, reason: 'Urea butuh air untuk larut, risiko terbakar' },
        npk_15:  { type: 'reduce', factor: 0.7, reason: 'Kurangi dosis saat kering' },
        kcl:     { type: 'safe', factor: 1.0, reason: 'KCl membantu ketahanan kekeringan' },
        sp36:    { type: 'safe', factor: 1.0, reason: 'SP-36 tidak terpengaruh signifikan' },
        za:      { type: 'reduce', factor: 0.6, reason: 'Kurangi saat air terbatas' },
        organik: { type: 'increase', factor: 1.3, reason: 'Organik membantu retensi air' },
      },
    },
    bekasBanjir: {
      id: 'bekasBanjir',
      name: 'Bekas Banjir / Genangan',
      adjustments: {
        urea:    { type: 'increase', factor: 1.3, reason: 'Nitrogen hilang saat banjir, perlu ditambah' },
        npk_15:  { type: 'increase', factor: 1.2, reason: 'Hara tercuci, perlu penambahan' },
        kcl:     { type: 'increase', factor: 1.4, reason: 'Kalium sangat mudah tercuci' },
        sp36:    { type: 'safe', factor: 1.0, reason: 'Fosfor relatif tidak tercuci' },
        za:      { type: 'caution', factor: 1.1, reason: 'Perhatikan pH pasca banjir' },
        organik: { type: 'increase', factor: 1.5, reason: 'Struktur tanah perlu diperbaiki' },
      },
    },
    seranganHama: {
      id: 'seranganHama',
      name: 'Serangan Hama / Penyakit',
      adjustments: {
        urea:    { type: 'reduce', factor: 0.6, reason: 'N berlebih memperparah serangan' },
        npk_15:  { type: 'reduce', factor: 0.8, reason: 'Kurangi N, pertahankan P-K' },
        kcl:     { type: 'increase', factor: 1.3, reason: 'K meningkatkan ketahanan tanaman' },
        sp36:    { type: 'safe', factor: 1.0, reason: 'P tidak mempengaruhi hama' },
        za:      { type: 'reduce', factor: 0.7, reason: 'Kurangi nitrogen' },
        organik: { type: 'safe', factor: 1.0, reason: 'Organik aman saat serangan' },
      },
    },
    lahanBaru: {
      id: 'lahanBaru',
      name: 'Lahan Baru / Belum Pernah Ditanam',
      adjustments: {
        urea:    { type: 'increase', factor: 1.2, reason: 'Lahan baru butuh N tambahan' },
        npk_15:  { type: 'increase', factor: 1.3, reason: 'Perlu hara lengkap' },
        kcl:     { type: 'safe', factor: 1.0, reason: 'K biasanya cukup di lahan baru' },
        sp36:    { type: 'increase', factor: 1.4, reason: 'P rendah di lahan baru' },
        za:      { type: 'safe', factor: 1.0, reason: 'ZA standar' },
        organik: { type: 'increase', factor: 2.0, reason: 'Organik sangat dibutuhkan di lahan baru' },
      },
    },
  },

  // ==================== INTERAKSI ANTAR PUPUK ====================
  interactions: {
    urea: {
      za:      { severity: 'major', message: 'Urea + ZA bersamaan = kelebihan Nitrogen, berisiko terbakar daun' },
      organik: { severity: 'minor', message: 'Urea + Organik: campurkan terpisah, jangan dicampur langsung' },
    },
    za: {
      sp36:    { severity: 'moderate', message: 'ZA + SP-36 dicampur bisa menggumpal, aplikasikan terpisah' },
      urea:    { severity: 'major', message: 'ZA + Urea bersamaan = kelebihan Nitrogen, toksik untuk tanaman' },
    },
    kcl: {
      sp36:    { severity: 'minor', message: 'KCl + SP-36: sebaiknya aplikasi terpisah 1 minggu' },
    },
    npk_15: {
      urea:    { severity: 'moderate', message: 'NPK sudah mengandung N, tambahan Urea harus dikurangi 50%' },
      za:      { severity: 'moderate', message: 'NPK sudah mengandung N, ZA tambahan harus dikurangi 50%' },
    },
  },

  // Fungsi helper: cek interaksi
  getInteraction(fertilizer1, fertilizer2) {
    if (fertilizer1 === fertilizer2) return null;
    if (this.interactions[fertilizer1]?.[fertilizer2]) {
      return this.interactions[fertilizer1][fertilizer2];
    }
    if (this.interactions[fertilizer2]?.[fertilizer1]) {
      return this.interactions[fertilizer2][fertilizer1];
    }
    return null;
  },
};

module.exports = fertilizerDatabase;
