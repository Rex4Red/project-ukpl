/**
 * MedDose - Dosage Calculator Module
 * ===================================
 * Modul utama perhitungan dosis obat.
 * 
 * Modul ini mengandung logika kritis dengan banyak percabangan (if/else)
 * dan perulangan yang cocok untuk:
 * - Whitebox Testing (Cyclomatic Complexity analysis)
 * - Blackbox Testing (Boundary Value Analysis)
 * - Stress Testing (concurrent calculations)
 */

const { DRUG_DATABASE } = require('./drugDatabase');

/**
 * Kategori usia dan rentang umurnya
 */
const AGE_CATEGORIES = {
  bayi:   { min: 0,  max: 1,  label: 'Bayi (0-1 tahun)' },
  anak:   { min: 1,  max: 12, label: 'Anak (1-12 tahun)' },
  remaja: { min: 12, max: 17, label: 'Remaja (12-17 tahun)' },
  dewasa: { min: 18, max: 64, label: 'Dewasa (18-64 tahun)' },
  lansia: { min: 65, max: 150, label: 'Lansia (65+ tahun)' }
};

/**
 * Menentukan kategori usia berdasarkan umur
 * @param {number} age - Usia dalam tahun
 * @returns {string|null} Kategori usia atau null jika tidak valid
 */
function determineAgeCategory(age) {
  if (age === null || age === undefined || typeof age !== 'number' || isNaN(age)) {
    return null;
  }
  if (age < 0) {
    return null;
  }
  if (age < 1) {
    return 'bayi';
  } else if (age < 12) {
    return 'anak';
  } else if (age < 18) {
    return 'remaja';
  } else if (age < 65) {
    return 'dewasa';
  } else {
    return 'lansia';
  }
}

/**
 * Validasi input perhitungan dosis
 * @param {Object} input - Input dari user
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateInput(input) {
  const errors = [];

  // Validasi nama pasien
  if (!input.patientName || typeof input.patientName !== 'string' || input.patientName.trim().length === 0) {
    errors.push('Nama pasien wajib diisi');
  } else if (input.patientName.trim().length < 2) {
    errors.push('Nama pasien minimal 2 karakter');
  } else if (input.patientName.trim().length > 100) {
    errors.push('Nama pasien maksimal 100 karakter');
  }

  // Validasi berat badan
  if (input.weight === null || input.weight === undefined) {
    errors.push('Berat badan wajib diisi');
  } else if (typeof input.weight !== 'number' || isNaN(input.weight)) {
    errors.push('Berat badan harus berupa angka');
  } else if (input.weight <= 0) {
    errors.push('Berat badan harus lebih dari 0 kg');
  } else if (input.weight < 0.5) {
    errors.push('Berat badan terlalu rendah (minimum 0.5 kg)');
  } else if (input.weight > 300) {
    errors.push('Berat badan terlalu tinggi (maksimum 300 kg)');
  }

  // Validasi usia
  if (input.age === null || input.age === undefined) {
    errors.push('Usia wajib diisi');
  } else if (typeof input.age !== 'number' || isNaN(input.age)) {
    errors.push('Usia harus berupa angka');
  } else if (input.age < 0) {
    errors.push('Usia tidak boleh negatif');
  } else if (input.age > 150) {
    errors.push('Usia tidak valid (maksimum 150 tahun)');
  }

  // Validasi drug ID
  if (!input.drugId || typeof input.drugId !== 'string') {
    errors.push('Jenis obat wajib dipilih');
  } else if (!DRUG_DATABASE[input.drugId]) {
    errors.push('Jenis obat tidak ditemukan dalam database');
  }

  // Validasi frekuensi
  if (input.frequency === null || input.frequency === undefined) {
    errors.push('Frekuensi pemberian wajib dipilih');
  } else if (typeof input.frequency !== 'number' || isNaN(input.frequency)) {
    errors.push('Frekuensi harus berupa angka');
  } else if (![4, 6, 8, 12, 24].includes(input.frequency)) {
    errors.push('Frekuensi pemberian tidak valid');
  }

  // Validasi kondisi khusus
  if (input.conditions && !Array.isArray(input.conditions)) {
    errors.push('Format kondisi khusus tidak valid');
  } else if (input.conditions) {
    const validConditions = ['gangguanGinjal', 'gangguanHati', 'hamil', 'menyusui'];
    for (let i = 0; i < input.conditions.length; i++) {
      if (!validConditions.includes(input.conditions[i])) {
        errors.push(`Kondisi khusus "${input.conditions[i]}" tidak valid`);
      }
    }
    // Cek konflik kondisi
    if (input.conditions.includes('hamil') && input.conditions.includes('menyusui')) {
      errors.push('Kondisi hamil dan menyusui tidak dapat dipilih bersamaan');
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Menghitung dosis obat berdasarkan input
 * @param {Object} input - Input perhitungan
 * @param {string} input.patientName - Nama pasien
 * @param {number} input.weight - Berat badan (kg)
 * @param {number} input.age - Usia (tahun)
 * @param {string} input.ageCategory - Kategori usia (opsional, akan ditentukan otomatis)
 * @param {string} input.drugId - ID obat
 * @param {number} input.frequency - Frekuensi pemberian (jam)
 * @param {string[]} input.conditions - Kondisi khusus
 * @param {string} input.interactingDrug - ID obat yang berinteraksi
 * @returns {Object} Hasil perhitungan
 */
function calculateDosage(input) {
  // STEP 1: Validasi input
  const validation = validateInput(input);
  if (!validation.valid) {
    return {
      success: false,
      errors: validation.errors,
      timestamp: new Date().toISOString()
    };
  }

  const drug = DRUG_DATABASE[input.drugId];
  const ageCategory = input.ageCategory || determineAgeCategory(input.age);
  const conditions = input.conditions || [];
  const warnings = [];
  let isContraindicated = false;

  // STEP 2: Cek batasan usia obat
  if (drug.ageRestrictions) {
    if (drug.ageRestrictions.minAge !== null && input.age < drug.ageRestrictions.minAge) {
      return {
        success: false,
        errors: [`${drug.name} tidak boleh diberikan untuk pasien di bawah ${drug.ageRestrictions.minAge} tahun`],
        timestamp: new Date().toISOString()
      };
    }
    if (drug.ageRestrictions.maxAge !== null && input.age > drug.ageRestrictions.maxAge) {
      return {
        success: false,
        errors: [`${drug.name} tidak direkomendasikan untuk pasien di atas ${drug.ageRestrictions.maxAge} tahun`],
        timestamp: new Date().toISOString()
      };
    }
  }

  // STEP 3: Cek frekuensi yang diizinkan
  if (!drug.allowedFrequencies.includes(input.frequency)) {
    return {
      success: false,
      errors: [`Frekuensi ${input.frequency} jam tidak tersedia untuk ${drug.name}. Pilihan: tiap ${drug.allowedFrequencies.join(', tiap ')} jam`],
      timestamp: new Date().toISOString()
    };
  }

  // STEP 4: Hitung dosis dasar berdasarkan berat badan
  let doseMin = roundDose(drug.dosePerKg.min * input.weight);
  let doseMax = roundDose(drug.dosePerKg.max * input.weight);
  let recommendedDose = roundDose((drug.dosePerKg.min + drug.dosePerKg.max) / 2 * input.weight);

  // STEP 5: Cek dan terapkan batas dosis tunggal maksimal
  const maxSingle = drug.maxSingleDose[ageCategory];
  if (maxSingle === null) {
    // Obat tidak direkomendasikan untuk kategori usia ini (dosis tunggal null)
    return {
      success: false,
      errors: [`${drug.name} tidak memiliki data dosis untuk kategori ${AGE_CATEGORIES[ageCategory].label}`],
      timestamp: new Date().toISOString()
    };
  }

  if (recommendedDose > maxSingle) {
    recommendedDose = maxSingle;
    warnings.push({
      type: 'info',
      message: `Dosis dibatasi ke ${maxSingle} ${drug.unit} (batas maksimal per pemberian untuk ${AGE_CATEGORIES[ageCategory].label})`
    });
  }
  if (doseMax > maxSingle) {
    doseMax = maxSingle;
  }
  if (doseMin > maxSingle) {
    doseMin = maxSingle;
  }

  // STEP 6: Proses kondisi khusus pasien
  let adjustmentFactor = 1;
  for (let i = 0; i < conditions.length; i++) {
    const conditionKey = conditions[i];
    const adjustment = drug.conditionAdjustments[conditionKey];

    if (adjustment) {
      if (adjustment.type === 'contraindicated') {
        isContraindicated = true;
        warnings.push({
          type: 'danger',
          message: adjustment.message
        });
      } else if (adjustment.type === 'reduce') {
        // Ambil faktor terkecil jika ada multiple reductions
        if (adjustment.factor < adjustmentFactor) {
          adjustmentFactor = adjustment.factor;
        }
        warnings.push({
          type: 'warning',
          message: adjustment.message
        });
      } else if (adjustment.type === 'caution') {
        warnings.push({
          type: 'warning',
          message: adjustment.message
        });
      } else if (adjustment.type === 'safe') {
        warnings.push({
          type: 'info',
          message: adjustment.message
        });
      }
    }
  }

  // Jika kontraindikasi, tetap kembalikan hasil tapi dengan status bahaya
  if (isContraindicated) {
    return {
      success: true,
      data: {
        patientName: input.patientName.trim(),
        drug: drug.name,
        drugCategory: drug.category,
        status: 'BAHAYA',
        statusMessage: 'KONTRAINDIKASI - Obat ini TIDAK BOLEH digunakan',
        dosePerAdministration: 0,
        doseMin: 0,
        doseMax: 0,
        frequency: input.frequency,
        frequencyLabel: `Tiap ${input.frequency} jam`,
        dosesPerDay: Math.floor(24 / input.frequency),
        totalDailyDose: 0,
        maxDailyDose: 0,
        remainingMargin: 0,
        marginPercentage: 0,
        unit: drug.unit,
        ageCategory: AGE_CATEGORIES[ageCategory].label,
        warnings: warnings,
        interactions: []
      },
      timestamp: new Date().toISOString()
    };
  }

  // STEP 7: Terapkan faktor penyesuaian kondisi
  if (adjustmentFactor < 1) {
    recommendedDose = roundDose(recommendedDose * adjustmentFactor);
    doseMin = roundDose(doseMin * adjustmentFactor);
    doseMax = roundDose(doseMax * adjustmentFactor);
  }

  // STEP 8: Hitung dosis harian
  const dosesPerDay = Math.floor(24 / input.frequency);
  const totalDailyDose = roundDose(recommendedDose * dosesPerDay);

  // STEP 9: Tentukan dosis maksimal harian
  let maxDailyDose;
  const maxDailyPerKg = drug.maxDailyDosePerKg[ageCategory];
  const maxDailyAbsolute = drug.maxDailyDoseAbsolute[ageCategory];

  if (maxDailyPerKg !== null && maxDailyAbsolute !== null) {
    // Ambil yang lebih kecil antara per-kg dan absolut
    maxDailyDose = Math.min(maxDailyPerKg * input.weight, maxDailyAbsolute);
  } else if (maxDailyPerKg !== null) {
    maxDailyDose = roundDose(maxDailyPerKg * input.weight);
  } else if (maxDailyAbsolute !== null) {
    maxDailyDose = maxDailyAbsolute;
  } else {
    // Fallback: gunakan dosis max single * dosis per hari
    maxDailyDose = maxSingle * dosesPerDay;
  }

  // Terapkan faktor penyesuaian ke max daily dose juga
  if (adjustmentFactor < 1) {
    maxDailyDose = roundDose(maxDailyDose * adjustmentFactor);
  }

  // STEP 10: Cek apakah total harian melebihi batas
  if (totalDailyDose > maxDailyDose) {
    // Hitung ulang dosis per pemberian agar tidak melebihi (bulatkan ke bawah)
    recommendedDose = Math.floor((maxDailyDose / dosesPerDay) * 100) / 100;
    warnings.push({
      type: 'warning',
      message: `Dosis disesuaikan agar total harian tidak melebihi ${maxDailyDose} ${drug.unit}/hari`
    });
  }

  // STEP 11: Hitung ulang total harian setelah penyesuaian
  const finalTotalDaily = roundDose(recommendedDose * dosesPerDay);
  const remainingMargin = roundDose(maxDailyDose - finalTotalDaily);
  const marginPercentage = maxDailyDose > 0
    ? roundDose((remainingMargin / maxDailyDose) * 100)
    : 0;

  // STEP 12: Tentukan status keamanan
  let status, statusMessage;
  const usagePercentage = maxDailyDose > 0 ? (finalTotalDaily / maxDailyDose) * 100 : 100;

  if (usagePercentage <= 60) {
    status = 'AMAN';
    statusMessage = 'Dosis dalam batas aman';
  } else if (usagePercentage <= 80) {
    status = 'PERHATIAN';
    statusMessage = 'Dosis mendekati batas, perlu pemantauan';
  } else if (usagePercentage <= 100) {
    status = 'PERINGATAN';
    statusMessage = 'Dosis di batas maksimal, pantau ketat';
    warnings.push({
      type: 'warning',
      message: 'Dosis mendekati atau di batas maksimal harian. Pantau pasien dengan ketat.'
    });
  } else {
    status = 'BAHAYA';
    statusMessage = 'MELEBIHI dosis maksimal harian!';
    warnings.push({
      type: 'danger',
      message: 'PERINGATAN: Total dosis harian melebihi batas maksimal! Segera konsultasikan dengan dokter.'
    });
  }

  // STEP 13: Cek interaksi obat
  const interactions = [];
  if (input.interactingDrug && input.interactingDrug !== 'none') {
    const interaction = drug.interactions[input.interactingDrug];
    if (interaction) {
      interactions.push({
        substance: input.interactingDrug,
        severity: interaction.severity,
        message: interaction.message
      });

      // Tingkatkan status jika ada interaksi mayor
      if (interaction.severity === 'major') {
        if (status === 'AMAN' || status === 'PERHATIAN') {
          status = 'PERINGATAN';
          statusMessage = 'Ada interaksi obat mayor yang perlu perhatian';
        }
        warnings.push({
          type: 'danger',
          message: `Interaksi Mayor: ${interaction.message}`
        });
      } else if (interaction.severity === 'moderate') {
        warnings.push({
          type: 'warning',
          message: `Interaksi Moderat: ${interaction.message}`
        });
      } else {
        warnings.push({
          type: 'info',
          message: `Interaksi Minor: ${interaction.message}`
        });
      }
    }
  }

  // STEP 14: Susun dan kembalikan hasil
  return {
    success: true,
    data: {
      patientName: input.patientName.trim(),
      drug: drug.name,
      drugCategory: drug.category,
      status: status,
      statusMessage: statusMessage,
      dosePerAdministration: recommendedDose,
      doseMin: doseMin,
      doseMax: doseMax,
      frequency: input.frequency,
      frequencyLabel: `Tiap ${input.frequency} jam`,
      dosesPerDay: dosesPerDay,
      totalDailyDose: finalTotalDaily,
      maxDailyDose: maxDailyDose,
      remainingMargin: remainingMargin,
      marginPercentage: marginPercentage,
      unit: drug.unit,
      ageCategory: AGE_CATEGORIES[ageCategory].label,
      warnings: warnings,
      interactions: interactions
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Membulatkan dosis ke 2 desimal
 * @param {number} dose - Dosis yang akan dibulatkan
 * @returns {number} Dosis yang sudah dibulatkan
 */
function roundDose(dose) {
  if (typeof dose !== 'number' || isNaN(dose)) {
    return 0;
  }
  return Math.round(dose * 100) / 100;
}

module.exports = {
  calculateDosage,
  validateInput,
  determineAgeCategory,
  roundDose,
  AGE_CATEGORIES
};
