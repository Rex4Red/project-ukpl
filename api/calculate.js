/**
 * API Endpoint: POST /api/calculate
 * Menghitung dosis obat berdasarkan input pasien.
 * Vercel Serverless Function.
 */
const { calculateDosage } = require('../lib/dosageCalculator');
const { DRUG_DATABASE, INTERACTION_SUBSTANCES } = require('../lib/drugDatabase');

module.exports = (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Return drug database for frontend
  if (req.method === 'GET') {
    const drugList = Object.values(DRUG_DATABASE).map(drug => ({
      id: drug.id,
      name: drug.name,
      category: drug.category,
      description: drug.description,
      dosePerKg: drug.dosePerKg,
      unit: drug.unit,
      allowedFrequencies: drug.allowedFrequencies,
      ageRestrictions: drug.ageRestrictions
    }));

    return res.status(200).json({
      success: true,
      data: {
        drugs: drugList,
        interactions: INTERACTION_SUBSTANCES
      }
    });
  }

  // POST: Calculate dosage
  if (req.method === 'POST') {
    try {
      const input = req.body;

      if (!input || typeof input !== 'object') {
        return res.status(400).json({
          success: false,
          errors: ['Request body tidak valid']
        });
      }

      // Parse numeric fields
      const parsedInput = {
        patientName: input.patientName || '',
        weight: parseFloat(input.weight),
        age: parseFloat(input.age),
        ageCategory: input.ageCategory || null,
        drugId: input.drugId || '',
        frequency: parseInt(input.frequency),
        conditions: input.conditions || [],
        interactingDrug: input.interactingDrug || 'none'
      };

      const result = calculateDosage(parsedInput);
      const statusCode = result.success ? 200 : 400;

      return res.status(statusCode).json(result);
    } catch (error) {
      console.error('Calculation error:', error);
      return res.status(500).json({
        success: false,
        errors: ['Terjadi kesalahan internal server']
      });
    }
  }

  return res.status(405).json({
    success: false,
    errors: ['Method tidak diizinkan']
  });
};
