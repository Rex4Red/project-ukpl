/**
 * FertiliCalc — Kalkulator Dosis Pupuk
 * ======================================
 * Modul utama perhitungan dosis pupuk tanaman.
 * Mengandung banyak percabangan (if/else) untuk:
 * - Whitebox testing (Cyclomatic Complexity)
 * - Blackbox testing (Boundary Value Analysis)
 */

const db = require('./fertilizerDatabase');

const dosageCalculator = {

  // ==================== STEP 1: VALIDASI INPUT ====================
  validateInput(data) {
    const errors = [];

    // Validasi nama petani
    if (!data.farmerName || typeof data.farmerName !== 'string') {
      errors.push('Nama petani wajib diisi');
    } else if (data.farmerName.trim().length < 2) {
      errors.push('Nama petani minimal 2 karakter');
    } else if (data.farmerName.trim().length > 100) {
      errors.push('Nama petani maksimal 100 karakter');
    }

    // Validasi luas lahan (m²)
    if (data.landArea === undefined || data.landArea === null || data.landArea === '') {
      errors.push('Luas lahan wajib diisi');
    } else if (typeof data.landArea !== 'number' || isNaN(data.landArea)) {
      errors.push('Luas lahan harus berupa angka');
    } else if (data.landArea < 1) {
      errors.push('Luas lahan minimal 1 m²');
    } else if (data.landArea > 100000) {
      errors.push('Luas lahan maksimal 100.000 m² (10 hektar)');
    }

    // Validasi usia tanam (hari)
    if (data.plantAge === undefined || data.plantAge === null || data.plantAge === '') {
      errors.push('Usia tanam wajib diisi');
    } else if (typeof data.plantAge !== 'number' || isNaN(data.plantAge)) {
      errors.push('Usia tanam harus berupa angka');
    } else if (data.plantAge < 0) {
      errors.push('Usia tanam tidak boleh negatif');
    } else if (data.plantAge > 365) {
      errors.push('Usia tanam maksimal 365 hari');
    }

    // Validasi pH tanah
    if (data.soilPh === undefined || data.soilPh === null || data.soilPh === '') {
      errors.push('pH tanah wajib diisi');
    } else if (typeof data.soilPh !== 'number' || isNaN(data.soilPh)) {
      errors.push('pH tanah harus berupa angka');
    } else if (data.soilPh < 0) {
      errors.push('pH tanah minimal 0');
    } else if (data.soilPh > 14) {
      errors.push('pH tanah maksimal 14');
    }

    // Validasi jenis tanaman
    if (!data.plantId || !db.plants[data.plantId]) {
      errors.push('Jenis tanaman tidak valid. Pilih: ' + Object.keys(db.plants).join(', '));
    }

    // Validasi jenis pupuk
    if (!data.fertilizerId || !db.fertilizers[data.fertilizerId]) {
      errors.push('Jenis pupuk tidak valid. Pilih: ' + Object.keys(db.fertilizers).join(', '));
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  // ==================== STEP 2: TENTUKAN FASE PERTUMBUHAN ====================
  determineGrowthPhase(plantId, plantAge) {
    const plant = db.plants[plantId];
    if (!plant) return null;

    // Percabangan untuk setiap fase
    if (plantAge >= plant.phases.panen.startDay && plantAge <= plant.phases.panen.endDay) {
      return 'panen';
    } else if (plantAge >= plant.phases.generatif.startDay && plantAge <= plant.phases.generatif.endDay) {
      return 'generatif';
    } else if (plantAge >= plant.phases.vegetatif.startDay && plantAge <= plant.phases.vegetatif.endDay) {
      return 'vegetatif';
    } else if (plantAge >= plant.phases.semai.startDay && plantAge <= plant.phases.semai.endDay) {
      return 'semai';
    } else {
      // Usia melebihi siklus tanam
      return 'panen';
    }
  },

  // ==================== STEP 3: HITUNG DOSIS PUPUK ====================
  calculateDosage(data) {
    // STEP 1: Validasi input
    const validation = this.validateInput(data);
    if (!validation.valid) {
      return {
        success: false,
        type: 'VALIDATION_ERROR',
        errors: validation.errors,
      };
    }

    const plant = db.plants[data.plantId];
    const fertilizer = db.fertilizers[data.fertilizerId];

    // STEP 2: Cek kesesuaian fase pertumbuhan
    const growthPhase = this.determineGrowthPhase(data.plantId, data.plantAge);

    if (!fertilizer.allowedPhases.includes(growthPhase)) {
      return {
        success: false,
        type: 'PHASE_ERROR',
        errors: [`Pupuk ${fertilizer.name} tidak direkomendasikan pada fase ${growthPhase}. Fase yang sesuai: ${fertilizer.allowedPhases.join(', ')}`],
      };
    }

    // STEP 3: Cek kesesuaian pH tanah
    let phWarning = null;
    if (data.soilPh < fertilizer.phRange.min) {
      phWarning = `pH tanah (${data.soilPh}) di bawah range optimal pupuk ${fertilizer.name} (${fertilizer.phRange.min}-${fertilizer.phRange.max}). Efektivitas pupuk berkurang.`;
    } else if (data.soilPh > fertilizer.phRange.max) {
      phWarning = `pH tanah (${data.soilPh}) di atas range optimal pupuk ${fertilizer.name} (${fertilizer.phRange.min}-${fertilizer.phRange.max}). Efektivitas pupuk berkurang.`;
    }

    // STEP 4: Hitung dosis dasar (per hektar)
    const baseDosePerHa = plant.baseDose[data.fertilizerId] || 0;

    // STEP 5: Terapkan faktor fase pertumbuhan
    const nutrientType = fertilizer.nutrient;
    let phaseFactor = 1.0;

    if (nutrientType === 'N' || nutrientType === 'NS') {
      phaseFactor = db.phaseFactors[growthPhase].N;
    } else if (nutrientType === 'P') {
      phaseFactor = db.phaseFactors[growthPhase].P;
    } else if (nutrientType === 'K') {
      phaseFactor = db.phaseFactors[growthPhase].K;
    } else if (nutrientType === 'NPK' || nutrientType === 'Multi') {
      phaseFactor = db.phaseFactors[growthPhase].Multi;
    } else {
      phaseFactor = 1.0;
    }

    let adjustedDosePerHa = baseDosePerHa * phaseFactor;

    // STEP 6: Terapkan faktor pH
    let phFactor = 1.0;
    const optPh = plant.optimalPh;

    if (data.soilPh < optPh.min - 1.5) {
      phFactor = 0.6; // pH sangat tidak sesuai
    } else if (data.soilPh < optPh.min) {
      phFactor = 0.8; // pH agak rendah
    } else if (data.soilPh > optPh.max + 1.5) {
      phFactor = 0.6; // pH sangat tidak sesuai
    } else if (data.soilPh > optPh.max) {
      phFactor = 0.8; // pH agak tinggi
    } else {
      phFactor = 1.0; // pH optimal
    }

    adjustedDosePerHa = adjustedDosePerHa * phFactor;

    // STEP 7: Proses kondisi khusus
    let conditionFactor = 1.0;
    let isContraindicated = false;
    const conditionWarnings = [];
    const conditionDetails = [];

    if (data.conditions && Array.isArray(data.conditions)) {
      for (const condId of data.conditions) {
        const condition = db.conditions[condId];
        if (!condition) continue;

        const adj = condition.adjustments[data.fertilizerId];
        if (!adj) continue;

        if (adj.type === 'contraindicated') {
          isContraindicated = true;
          conditionWarnings.push(`⛔ ${fertilizer.name} TIDAK BOLEH digunakan: ${adj.reason}`);
          conditionDetails.push({ condition: condition.name, type: adj.type, reason: adj.reason });
        } else if (adj.type === 'reduce') {
          conditionFactor *= adj.factor;
          conditionWarnings.push(`⚠️ ${condition.name}: dosis dikurangi ${((1 - adj.factor) * 100).toFixed(0)}% — ${adj.reason}`);
          conditionDetails.push({ condition: condition.name, type: adj.type, factor: adj.factor, reason: adj.reason });
        } else if (adj.type === 'increase') {
          conditionFactor *= adj.factor;
          conditionWarnings.push(`📈 ${condition.name}: dosis ditambah ${((adj.factor - 1) * 100).toFixed(0)}% — ${adj.reason}`);
          conditionDetails.push({ condition: condition.name, type: adj.type, factor: adj.factor, reason: adj.reason });
        } else if (adj.type === 'caution') {
          conditionFactor *= adj.factor;
          conditionWarnings.push(`⚠️ ${condition.name}: perlu perhatian — ${adj.reason}`);
          conditionDetails.push({ condition: condition.name, type: adj.type, factor: adj.factor, reason: adj.reason });
        } else if (adj.type === 'safe') {
          conditionDetails.push({ condition: condition.name, type: adj.type, reason: adj.reason });
        }
      }
    }

    // STEP 8: Cek kontraindikasi
    if (isContraindicated) {
      return {
        success: true,
        type: 'CONTRAINDICATED',
        farmerName: data.farmerName,
        plant: plant.name,
        fertilizer: fertilizer.name,
        growthPhase,
        warnings: conditionWarnings,
        message: `Pupuk ${fertilizer.name} TIDAK BOLEH digunakan pada kondisi saat ini.`,
      };
    }

    // STEP 9: Terapkan faktor kondisi
    adjustedDosePerHa = adjustedDosePerHa * conditionFactor;

    // STEP 10: Cek batas maksimum per hektar
    const maxPerHa = fertilizer.maxPerHectare;
    let isOverMax = false;

    if (adjustedDosePerHa > maxPerHa) {
      isOverMax = true;
      adjustedDosePerHa = maxPerHa;
    }

    // STEP 11: Konversi ke luas lahan aktual
    const hectares = data.landArea / 10000;
    const totalDose = adjustedDosePerHa * hectares;
    const totalDoseMin = totalDose * 0.85;
    const totalDoseMax = totalDose * 1.15;

    // STEP 12: Hitung biaya
    const estimatedCost = totalDose * fertilizer.pricePerKg;

    // STEP 13: Tentukan status keamanan
    let safetyStatus, safetyColor;
    const usageRatio = (adjustedDosePerHa / maxPerHa) * 100;

    if (usageRatio <= 50) {
      safetyStatus = 'AMAN';
      safetyColor = 'green';
    } else if (usageRatio <= 75) {
      safetyStatus = 'NORMAL';
      safetyColor = 'blue';
    } else if (usageRatio <= 100) {
      safetyStatus = 'PERHATIAN';
      safetyColor = 'orange';
    } else {
      safetyStatus = 'BAHAYA - MELEBIHI BATAS';
      safetyColor = 'red';
    }

    // STEP 14: Cek interaksi dengan pupuk lain
    let interactionWarning = null;
    if (data.otherFertilizer && data.otherFertilizer !== 'none') {
      const interaction = db.getInteraction(data.fertilizerId, data.otherFertilizer);
      if (interaction) {
        if (interaction.severity === 'major') {
          interactionWarning = {
            severity: 'major',
            icon: '🔴',
            message: interaction.message,
          };
        } else if (interaction.severity === 'moderate') {
          interactionWarning = {
            severity: 'moderate',
            icon: '🟡',
            message: interaction.message,
          };
        } else {
          interactionWarning = {
            severity: 'minor',
            icon: '🟢',
            message: interaction.message,
          };
        }
      }
    }

    // STEP 15: Return hasil perhitungan
    return {
      success: true,
      type: 'CALCULATION',
      farmerName: data.farmerName,
      plant: { id: plant.id, name: plant.name, category: plant.category },
      fertilizer: { id: fertilizer.id, name: fertilizer.name, type: fertilizer.type },
      landArea: data.landArea,
      landAreaHa: hectares,
      plantAge: data.plantAge,
      growthPhase,
      phaseLabel: plant.phases[growthPhase].label,
      soilPh: data.soilPh,
      dosage: {
        perHectare: Math.round(adjustedDosePerHa * 100) / 100,
        total: Math.round(totalDose * 100) / 100,
        min: Math.round(totalDoseMin * 100) / 100,
        max: Math.round(totalDoseMax * 100) / 100,
        unit: fertilizer.unit,
        maxAllowedPerHa: maxPerHa,
        isOverMax,
      },
      factors: {
        phaseFactor: Math.round(phaseFactor * 100) / 100,
        phFactor: Math.round(phFactor * 100) / 100,
        conditionFactor: Math.round(conditionFactor * 100) / 100,
      },
      safety: { status: safetyStatus, color: safetyColor, usagePercent: Math.round(usageRatio * 100) / 100 },
      estimatedCost: Math.round(estimatedCost),
      phWarning,
      conditionWarnings,
      conditionDetails,
      interactionWarning,
    };
  },
};

module.exports = dosageCalculator;
