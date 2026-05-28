/**
 * FertiliCalc — Kalkulator Dosis Pupuk
 * ======================================
 * Modul utama perhitungan dosis pupuk tanaman.
 */

const db = require('./fertilizerDatabase');

const dosageCalculator = {

  // ==================== VALIDASI INPUT ====================
  validateInput(data) {
    const errors = [];

    if (!data.farmerName || typeof data.farmerName !== 'string' || data.farmerName.trim().length < 2) {
      errors.push('Nama petani wajib diisi (minimal 2 karakter)');
    }

    if (!data.landArea || typeof data.landArea !== 'number' || data.landArea < 1 || data.landArea > 100000) {
      errors.push('Luas lahan harus berupa angka antara 1 - 100.000 m²');
    }

    if (data.plantAge === undefined || typeof data.plantAge !== 'number' || data.plantAge < 0 || data.plantAge > 365) {
      errors.push('Usia tanam harus berupa angka antara 0 - 365 hari');
    }

    if (data.soilPh === undefined || typeof data.soilPh !== 'number' || data.soilPh < 0 || data.soilPh > 14) {
      errors.push('pH tanah harus berupa angka antara 0 - 14');
    }

    if (!data.plantId || !db.plants[data.plantId]) {
      errors.push('Jenis tanaman tidak valid');
    }

    if (!data.fertilizerId || !db.fertilizers[data.fertilizerId]) {
      errors.push('Jenis pupuk tidak valid');
    }

    return { valid: errors.length === 0, errors };
  },

  // ==================== TENTUKAN FASE PERTUMBUHAN ====================
  determineGrowthPhase(plantId, plantAge) {
    const plant = db.plants[plantId];
    if (!plant) return null;

    const phaseOrder = ['panen', 'generatif', 'vegetatif', 'semai'];
    for (const phase of phaseOrder) {
      if (plantAge >= plant.phases[phase].startDay && plantAge <= plant.phases[phase].endDay) {
        return phase;
      }
    }
    return 'panen';
  },

  // ==================== HITUNG DOSIS PUPUK ====================
  calculateDosage(data) {

    // 1. Validasi input
    const validation = this.validateInput(data);
    if (!validation.valid) {
      return { success: false, type: 'VALIDATION_ERROR', errors: validation.errors };
    }

    const plant = db.plants[data.plantId];
    const fertilizer = db.fertilizers[data.fertilizerId];

    // 2. Cek fase tanaman
    const growthPhase = this.determineGrowthPhase(data.plantId, data.plantAge);
    if (!fertilizer.allowedPhases.includes(growthPhase)) {
      return {
        success: false, type: 'PHASE_ERROR',
        errors: [`Pupuk ${fertilizer.name} tidak direkomendasikan pada fase ${growthPhase}`],
      };
    }

    // 3. Cek pH tanah
    let phWarning = null;
    if (data.soilPh < fertilizer.phRange.min || data.soilPh > fertilizer.phRange.max) {
      phWarning = `pH tanah (${data.soilPh}) di luar range optimal pupuk ${fertilizer.name} (${fertilizer.phRange.min}-${fertilizer.phRange.max})`;
    }

    // 4. Hitung faktor fase
    const nutrientMap = { 'N': 'N', 'NS': 'N', 'P': 'P', 'K': 'K', 'NPK': 'Multi', 'Multi': 'Multi' };
    const nutrientKey = nutrientMap[fertilizer.nutrient] || 'Multi';
    const phaseFactor = db.phaseFactors[growthPhase][nutrientKey] || 1.0;
    const baseDosePerHa = plant.baseDose[data.fertilizerId] || 0;
    let adjustedDosePerHa = baseDosePerHa * phaseFactor;

    // 5. Hitung faktor pH
    const optPh = plant.optimalPh;
    const phDeviation = Math.max(optPh.min - data.soilPh, data.soilPh - optPh.max, 0);
    const phFactor = phDeviation > 1.5 ? 0.6 : phDeviation > 0 ? 0.8 : 1.0;
    adjustedDosePerHa *= phFactor;

    // 6. Proses kondisi khusus
    let conditionFactor = 1.0;
    let isContraindicated = false;
    const conditionWarnings = [];

    if (data.conditions && Array.isArray(data.conditions)) {
      for (const condId of data.conditions) {
        const condition = db.conditions[condId];
        if (!condition) continue;
        const adj = condition.adjustments[data.fertilizerId];
        if (!adj) continue;

        if (adj.type === 'contraindicated') {
          isContraindicated = true;
          conditionWarnings.push(`⛔ ${fertilizer.name} TIDAK BOLEH digunakan: ${adj.reason}`);
        } else {
          conditionFactor *= adj.factor;
          conditionWarnings.push(`⚠️ ${condition.name}: ${adj.reason}`);
        }
      }
    }

    // 7. Cek kontraindikasi
    if (isContraindicated) {
      return {
        success: true, type: 'CONTRAINDICATED',
        farmerName: data.farmerName, plant: plant.name, fertilizer: fertilizer.name,
        growthPhase, warnings: conditionWarnings,
        message: `Pupuk ${fertilizer.name} TIDAK BOLEH digunakan pada kondisi saat ini.`,
      };
    }

    // 8. Cek batas maksimum
    adjustedDosePerHa *= conditionFactor;
    const maxPerHa = fertilizer.maxPerHectare;
    const isOverMax = adjustedDosePerHa > maxPerHa;
    if (isOverMax) adjustedDosePerHa = maxPerHa;

    // 9. Hitung biaya
    const hectares = data.landArea / 10000;
    const totalDose = adjustedDosePerHa * hectares;
    const estimatedCost = totalDose * fertilizer.pricePerKg;

    // 10. Tentukan safety status
    const usageRatio = (adjustedDosePerHa / maxPerHa) * 100;
    const safetyLevels = [
      { max: 50, status: 'AMAN', color: 'green' },
      { max: 75, status: 'NORMAL', color: 'blue' },
      { max: 100, status: 'PERHATIAN', color: 'orange' },
      { max: Infinity, status: 'BAHAYA - MELEBIHI BATAS', color: 'red' },
    ];
    const safety = safetyLevels.find(s => usageRatio <= s.max);

    // 11. Cek interaksi pupuk
    let interactionWarning = null;
    if (data.otherFertilizer && data.otherFertilizer !== 'none') {
      const interaction = db.getInteraction(data.fertilizerId, data.otherFertilizer);
      if (interaction) {
        const icons = { major: '🔴', moderate: '🟡', minor: '🟢' };
        interactionWarning = {
          severity: interaction.severity,
          icon: icons[interaction.severity] || '🟢',
          message: interaction.message,
        };
      }
    }

    // 12. Return hasil
    return {
      success: true, type: 'CALCULATION',
      farmerName: data.farmerName,
      plant: { id: plant.id, name: plant.name, category: plant.category },
      fertilizer: { id: fertilizer.id, name: fertilizer.name, type: fertilizer.type },
      landArea: data.landArea, landAreaHa: hectares,
      plantAge: data.plantAge, growthPhase,
      phaseLabel: plant.phases[growthPhase].label,
      soilPh: data.soilPh,
      dosage: {
        perHectare: Math.round(adjustedDosePerHa * 100) / 100,
        total: Math.round(totalDose * 100) / 100,
        min: Math.round(totalDose * 0.85 * 100) / 100,
        max: Math.round(totalDose * 1.15 * 100) / 100,
        unit: fertilizer.unit, maxAllowedPerHa: maxPerHa, isOverMax,
      },
      factors: {
        phaseFactor: Math.round(phaseFactor * 100) / 100,
        phFactor: Math.round(phFactor * 100) / 100,
        conditionFactor: Math.round(conditionFactor * 100) / 100,
      },
      safety: { status: safety.status, color: safety.color, usagePercent: Math.round(usageRatio * 100) / 100 },
      estimatedCost: Math.round(estimatedCost),
      phWarning, conditionWarnings, interactionWarning,
    };
  },
};

module.exports = dosageCalculator;
