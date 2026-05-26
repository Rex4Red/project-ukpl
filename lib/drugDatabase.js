/**
 * Database obat-obatan dengan aturan dosis lengkap.
 * Setiap obat memiliki:
 * - dosePerKg: dosis per kg berat badan (mg/kg) per pemberian
 * - maxDailyDose: dosis maksimal per hari berdasarkan kategori usia
 * - maxSingleDose: dosis maksimal per pemberian berdasarkan kategori usia
 * - allowedFrequencies: frekuensi pemberian yang diizinkan (dalam jam)
 * - ageRestrictions: batasan usia
 * - conditionAdjustments: penyesuaian dosis untuk kondisi khusus
 * - interactions: interaksi dengan obat/zat lain
 */

const DRUG_DATABASE = {
  paracetamol: {
    id: 'paracetamol',
    name: 'Paracetamol',
    category: 'Analgesik & Antipiretik',
    description: 'Obat pereda nyeri dan penurun demam',
    dosePerKg: { min: 10, max: 15 },
    unit: 'mg',
    maxSingleDose: {
      bayi: 60,
      anak: 500,
      remaja: 1000,
      dewasa: 1000,
      lansia: 750
    },
    maxDailyDosePerKg: {
      bayi: 60,
      anak: 60,
      remaja: null,
      dewasa: null,
      lansia: null
    },
    maxDailyDoseAbsolute: {
      bayi: null,
      anak: null,
      remaja: 4000,
      dewasa: 4000,
      lansia: 3000
    },
    allowedFrequencies: [4, 6, 8],
    ageRestrictions: {
      minAge: 0,
      maxAge: null
    },
    conditionAdjustments: {
      gangguanGinjal: {
        factor: 0.75,
        type: 'reduce',
        message: 'Dosis dikurangi 25% karena gangguan ginjal'
      },
      gangguanHati: {
        factor: 0,
        type: 'contraindicated',
        message: 'KONTRAINDIKASI: Paracetamol sangat berbahaya untuk pasien dengan gangguan hati berat'
      },
      hamil: {
        factor: 1,
        type: 'caution',
        message: 'Kategori B: Relatif aman, gunakan dosis minimum efektif'
      },
      menyusui: {
        factor: 1,
        type: 'safe',
        message: 'Aman untuk ibu menyusui dalam dosis terapeutik normal'
      }
    },
    interactions: {
      warfarin: {
        severity: 'major',
        message: 'Meningkatkan efek antikoagulan Warfarin, risiko perdarahan meningkat'
      },
      alcohol: {
        severity: 'major',
        message: 'Kombinasi dengan Alkohol rutin meningkatkan risiko hepatotoksisitas (kerusakan hati) secara signifikan'
      },
      phenytoin: {
        severity: 'moderate',
        message: 'Phenytoin dapat mengurangi efektivitas Paracetamol dan meningkatkan risiko hepatotoksisitas'
      },
      metoclopramide: {
        severity: 'minor',
        message: 'Metoclopramide meningkatkan penyerapan Paracetamol (efek lebih cepat)'
      }
    }
  },

  amoxicillin: {
    id: 'amoxicillin',
    name: 'Amoxicillin',
    category: 'Antibiotik',
    description: 'Antibiotik golongan penisilin spektrum luas',
    dosePerKg: { min: 25, max: 50 },
    unit: 'mg',
    maxSingleDose: {
      bayi: 125,
      anak: 500,
      remaja: 1000,
      dewasa: 1000,
      lansia: 750
    },
    maxDailyDosePerKg: {
      bayi: 100,
      anak: 100,
      remaja: null,
      dewasa: null,
      lansia: null
    },
    maxDailyDoseAbsolute: {
      bayi: null,
      anak: null,
      remaja: 3000,
      dewasa: 3000,
      lansia: 2000
    },
    allowedFrequencies: [8, 12],
    ageRestrictions: {
      minAge: 0,
      maxAge: null
    },
    conditionAdjustments: {
      gangguanGinjal: {
        factor: 0.5,
        type: 'reduce',
        message: 'Dosis dikurangi 50% dan interval diperpanjang karena gangguan ginjal'
      },
      gangguanHati: {
        factor: 0.85,
        type: 'caution',
        message: 'Gunakan dengan hati-hati, monitor fungsi hati secara berkala'
      },
      hamil: {
        factor: 1,
        type: 'caution',
        message: 'Kategori B: Relatif aman namun gunakan hanya jika diperlukan'
      },
      menyusui: {
        factor: 1,
        type: 'caution',
        message: 'Dapat masuk ke ASI dalam jumlah kecil, monitor bayi terhadap diare'
      }
    },
    interactions: {
      warfarin: {
        severity: 'moderate',
        message: 'Dapat meningkatkan efek Warfarin, monitor INR lebih sering'
      },
      methotrexate: {
        severity: 'major',
        message: 'Meningkatkan toksisitas Methotrexate secara signifikan'
      },
      contraceptive: {
        severity: 'moderate',
        message: 'Dapat mengurangi efektivitas kontrasepsi oral'
      }
    }
  },

  ibuprofen: {
    id: 'ibuprofen',
    name: 'Ibuprofen',
    category: 'NSAID (Anti-inflamasi Non-Steroid)',
    description: 'Obat anti-inflamasi, pereda nyeri, dan penurun demam',
    dosePerKg: { min: 5, max: 10 },
    unit: 'mg',
    maxSingleDose: {
      bayi: null,
      anak: 400,
      remaja: 400,
      dewasa: 800,
      lansia: 400
    },
    maxDailyDosePerKg: {
      bayi: null,
      anak: 40,
      remaja: null,
      dewasa: null,
      lansia: null
    },
    maxDailyDoseAbsolute: {
      bayi: null,
      anak: null,
      remaja: 1200,
      dewasa: 2400,
      lansia: 1200
    },
    allowedFrequencies: [6, 8],
    ageRestrictions: {
      minAge: 0.5,
      maxAge: null
    },
    conditionAdjustments: {
      gangguanGinjal: {
        factor: 0,
        type: 'contraindicated',
        message: 'KONTRAINDIKASI: Ibuprofen dapat memperburuk fungsi ginjal'
      },
      gangguanHati: {
        factor: 0.5,
        type: 'reduce',
        message: 'Dosis dikurangi 50%, monitor fungsi hati ketat'
      },
      hamil: {
        factor: 0,
        type: 'contraindicated',
        message: 'KONTRAINDIKASI: Ibuprofen dilarang pada kehamilan terutama trimester 3'
      },
      menyusui: {
        factor: 1,
        type: 'safe',
        message: 'Jumlah minimal masuk ke ASI, aman untuk ibu menyusui'
      }
    },
    interactions: {
      aspirin: {
        severity: 'major',
        message: 'Mengurangi efek kardioprotektif Aspirin dan meningkatkan risiko perdarahan GI'
      },
      warfarin: {
        severity: 'major',
        message: 'Meningkatkan risiko perdarahan secara signifikan'
      },
      alcohol: {
        severity: 'major',
        message: 'Meningkatkan risiko perdarahan saluran cerna dan kerusakan lambung'
      },
      lithium: {
        severity: 'moderate',
        message: 'Meningkatkan kadar Lithium dalam darah, risiko toksisitas'
      }
    }
  },

  metformin: {
    id: 'metformin',
    name: 'Metformin',
    category: 'Antidiabetes',
    description: 'Obat antidiabetes oral golongan biguanid',
    dosePerKg: { min: 10, max: 15 },
    unit: 'mg',
    maxSingleDose: {
      bayi: null,
      anak: 500,
      remaja: 1000,
      dewasa: 1000,
      lansia: 500
    },
    maxDailyDosePerKg: {
      bayi: null,
      anak: null,
      remaja: null,
      dewasa: null,
      lansia: null
    },
    maxDailyDoseAbsolute: {
      bayi: null,
      anak: 2000,
      remaja: 2000,
      dewasa: 2550,
      lansia: 1700
    },
    allowedFrequencies: [8, 12],
    ageRestrictions: {
      minAge: 10,
      maxAge: 80
    },
    conditionAdjustments: {
      gangguanGinjal: {
        factor: 0,
        type: 'contraindicated',
        message: 'KONTRAINDIKASI: Metformin dilarang pada gangguan ginjal (risiko asidosis laktat)'
      },
      gangguanHati: {
        factor: 0,
        type: 'contraindicated',
        message: 'KONTRAINDIKASI: Metformin dilarang pada gangguan hati berat'
      },
      hamil: {
        factor: 0,
        type: 'contraindicated',
        message: 'KONTRAINDIKASI: Ganti ke insulin selama kehamilan'
      },
      menyusui: {
        factor: 1,
        type: 'caution',
        message: 'Masuk ke ASI dalam jumlah kecil, monitor kadar gula bayi'
      }
    },
    interactions: {
      alcohol: {
        severity: 'major',
        message: 'Meningkatkan risiko asidosis laktat secara signifikan'
      },
      insulin: {
        severity: 'moderate',
        message: 'Risiko hipoglikemia meningkat, sesuaikan dosis insulin'
      },
      cimetidine: {
        severity: 'moderate',
        message: 'Cimetidine meningkatkan kadar Metformin dalam darah'
      }
    }
  },

  omeprazole: {
    id: 'omeprazole',
    name: 'Omeprazole',
    category: 'Penghambat Pompa Proton (PPI)',
    description: 'Obat untuk mengurangi produksi asam lambung',
    dosePerKg: { min: 0.5, max: 1 },
    unit: 'mg',
    maxSingleDose: {
      bayi: 10,
      anak: 20,
      remaja: 20,
      dewasa: 40,
      lansia: 20
    },
    maxDailyDosePerKg: {
      bayi: 3,
      anak: 3,
      remaja: null,
      dewasa: null,
      lansia: null
    },
    maxDailyDoseAbsolute: {
      bayi: null,
      anak: null,
      remaja: 40,
      dewasa: 40,
      lansia: 20
    },
    allowedFrequencies: [12, 24],
    ageRestrictions: {
      minAge: 1,
      maxAge: null
    },
    conditionAdjustments: {
      gangguanGinjal: {
        factor: 1,
        type: 'safe',
        message: 'Tidak perlu penyesuaian dosis pada gangguan ginjal'
      },
      gangguanHati: {
        factor: 0.5,
        type: 'reduce',
        message: 'Dosis maksimal 20mg/hari pada gangguan hati berat'
      },
      hamil: {
        factor: 1,
        type: 'caution',
        message: 'Kategori C: Gunakan hanya jika manfaat melebihi risiko'
      },
      menyusui: {
        factor: 1,
        type: 'caution',
        message: 'Data terbatas, gunakan dengan hati-hati'
      }
    },
    interactions: {
      clopidogrel: {
        severity: 'major',
        message: 'Mengurangi efektivitas Clopidogrel secara signifikan, risiko trombosis'
      },
      warfarin: {
        severity: 'moderate',
        message: 'Dapat meningkatkan efek Warfarin, monitor INR'
      },
      methotrexate: {
        severity: 'moderate',
        message: 'Meningkatkan kadar Methotrexate, risiko toksisitas'
      }
    }
  },

  cetirizine: {
    id: 'cetirizine',
    name: 'Cetirizine',
    category: 'Antihistamin',
    description: 'Obat antihistamin generasi kedua untuk alergi',
    dosePerKg: { min: 0.125, max: 0.25 },
    unit: 'mg',
    maxSingleDose: {
      bayi: 2.5,
      anak: 5,
      remaja: 10,
      dewasa: 10,
      lansia: 5
    },
    maxDailyDosePerKg: {
      bayi: null,
      anak: null,
      remaja: null,
      dewasa: null,
      lansia: null
    },
    maxDailyDoseAbsolute: {
      bayi: 5,
      anak: 10,
      remaja: 10,
      dewasa: 10,
      lansia: 5
    },
    allowedFrequencies: [12, 24],
    ageRestrictions: {
      minAge: 0.5,
      maxAge: null
    },
    conditionAdjustments: {
      gangguanGinjal: {
        factor: 0.5,
        type: 'reduce',
        message: 'Dosis dikurangi 50% pada gangguan ginjal'
      },
      gangguanHati: {
        factor: 0.5,
        type: 'reduce',
        message: 'Dosis dikurangi 50% pada gangguan hati'
      },
      hamil: {
        factor: 1,
        type: 'caution',
        message: 'Kategori B: Gunakan hanya jika diperlukan'
      },
      menyusui: {
        factor: 0,
        type: 'contraindicated',
        message: 'KONTRAINDIKASI: Cetirizine masuk ke ASI dan dapat menyebabkan kantuk pada bayi'
      }
    },
    interactions: {
      alcohol: {
        severity: 'moderate',
        message: 'Meningkatkan efek sedasi, hindari konsumsi alkohol'
      },
      theophylline: {
        severity: 'minor',
        message: 'Theophylline dapat sedikit mengurangi klirens Cetirizine'
      }
    }
  }
};

/**
 * Daftar interaksi obat untuk dropdown
 */
const INTERACTION_SUBSTANCES = [
  { id: 'none', name: 'Tidak ada' },
  { id: 'alcohol', name: 'Alkohol (konsumsi rutin)' },
  { id: 'warfarin', name: 'Warfarin' },
  { id: 'aspirin', name: 'Aspirin' },
  { id: 'methotrexate', name: 'Methotrexate' },
  { id: 'phenytoin', name: 'Phenytoin' },
  { id: 'lithium', name: 'Lithium' },
  { id: 'insulin', name: 'Insulin' },
  { id: 'cimetidine', name: 'Cimetidine' },
  { id: 'clopidogrel', name: 'Clopidogrel' },
  { id: 'contraceptive', name: 'Kontrasepsi Oral' },
  { id: 'metoclopramide', name: 'Metoclopramide' },
  { id: 'theophylline', name: 'Theophylline' }
];

module.exports = { DRUG_DATABASE, INTERACTION_SUBSTANCES };
