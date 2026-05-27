/**
 * FertiliCalc — API Handler
 * ==========================
 * Endpoint POST /api/calculate untuk perhitungan dosis pupuk.
 */

const dosageCalculator = require('../lib/dosageCalculator');

module.exports = (req, res) => {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const {
      farmerName,
      plantId,
      fertilizerId,
      landArea,
      plantAge,
      soilPh,
      conditions,
      otherFertilizer,
    } = req.body;

    // Parse numeric values
    const input = {
      farmerName: farmerName ? String(farmerName).trim() : '',
      plantId,
      fertilizerId,
      landArea: landArea !== undefined ? Number(landArea) : undefined,
      plantAge: plantAge !== undefined ? Number(plantAge) : undefined,
      soilPh: soilPh !== undefined ? Number(soilPh) : undefined,
      conditions: Array.isArray(conditions) ? conditions : [],
      otherFertilizer: otherFertilizer || 'none',
    };

    // Calculate
    const result = dosageCalculator.calculateDosage(input);

    if (!result.success && result.type === 'VALIDATION_ERROR') {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      type: 'SERVER_ERROR',
      error: 'Terjadi kesalahan server. Silakan coba lagi.',
    });
  }
};
