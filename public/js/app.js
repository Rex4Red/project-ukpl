/**
 * FertiliCalc — Frontend Logic
 * =============================
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('calcForm');
  const resultSection = document.getElementById('resultSection');
  const resultContent = document.getElementById('resultContent');
  const submitBtn = document.getElementById('submitBtn');
  const phaseHint = document.getElementById('phaseHint');
  const resultPlaceholder = document.getElementById('resultPlaceholder');

  // =========== Phase hint on plant/age change ===========
  const plantAgeInput = document.getElementById('plantAge');
  const plantSelect = document.getElementById('plantId');

  const plantPhases = {
    padi:   { semai: [0,20], vegetatif: [21,60], generatif: [61,100], panen: [101,120], max: 120 },
    jagung: { semai: [0,14], vegetatif: [15,50], generatif: [51,85],  panen: [86,100],  max: 100 },
    cabai:  { semai: [0,30], vegetatif: [31,70], generatif: [71,130], panen: [131,150], max: 150 },
    tomat:  { semai: [0,25], vegetatif: [26,55], generatif: [56,100], panen: [101,120], max: 120 },
    sawit:  { semai: [0,90], vegetatif: [91,200],generatif: [201,330],panen: [331,365], max: 365 },
    bawang: { semai: [0,10], vegetatif: [11,35], generatif: [36,60],  panen: [61,70],   max: 70  },
  };

  const phaseLabels = {
    semai: '🌱 Semai', vegetatif: '🌿 Vegetatif', generatif: '🌸 Generatif', panen: '🌾 Panen',
  };

  function updatePhaseHint() {
    const plant = plantSelect.value;
    const age = parseInt(plantAgeInput.value);

    if (!plant || !plantPhases[plant]) {
      phaseHint.textContent = 'Min: 0 | Max: 365 hari';
      return;
    }

    const phases = plantPhases[plant];
    phaseHint.textContent = `Siklus: ${phases.max} hari`;

    if (isNaN(age)) return;

    for (const [phase, [start, end]] of Object.entries(phases)) {
      if (phase === 'max') continue;
      if (age >= start && age <= end) {
        phaseHint.textContent = `${phaseLabels[phase]} (hari ${start}-${end})`;
        phaseHint.style.color = '#4caf50';
        return;
      }
    }

    if (age > phases.max) {
      phaseHint.textContent = `⚠️ Melebihi siklus tanam (${phases.max} hari)`;
      phaseHint.style.color = '#fb8c00';
    }
  }

  plantAgeInput.addEventListener('input', updatePhaseHint);
  plantSelect.addEventListener('change', updatePhaseHint);

  // =========== Form submit ===========
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    submitBtn.disabled = true;

    // Gather conditions checkboxes
    const condCheckboxes = form.querySelectorAll('input[name="conditions"]:checked');
    const conditions = Array.from(condCheckboxes).map(cb => cb.value);

    const payload = {
      farmerName: form.farmerName.value,
      plantId: form.plantId.value,
      fertilizerId: form.fertilizerId.value,
      landArea: parseFloat(form.landArea.value),
      plantAge: parseInt(form.plantAge.value),
      soilPh: parseFloat(form.soilPh.value),
      conditions,
      otherFertilizer: form.otherFertilizer.value,
    };

    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      renderResult(data);
    } catch (err) {
      renderError(['Gagal menghubungi server. Pastikan server berjalan.']);
    } finally {
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
      submitBtn.disabled = false;
    }
  });

  // =========== Render Functions ===========
  function renderResult(data) {
    resultSection.style.display = 'block';
    if (resultPlaceholder) resultPlaceholder.style.display = 'none';

    if (!data.success && data.type === 'VALIDATION_ERROR') {
      renderError(data.errors);
      return;
    }

    if (data.type === 'CONTRAINDICATED') {
      resultContent.innerHTML = `
        <div class="result-card">
          <div class="result-header">
            <span class="result-icon">⛔</span>
            <h2>Pupuk Tidak Direkomendasikan</h2>
          </div>
          <p style="margin-bottom:1rem;color:var(--text-secondary)">
            <strong>${data.farmerName}</strong> — ${data.plant} | Fase: ${data.growthPhase}
          </p>
          <div class="warning-box error">${data.message}</div>
          ${data.warnings.map(w => `<div class="warning-box warn">${w}</div>`).join('')}
        </div>`;
      scrollToResult();
      return;
    }

    // Normal calculation result
    const d = data.dosage;
    const s = data.safety;

    let warningsHtml = '';
    if (data.phWarning) {
      warningsHtml += `<div class="warning-box info">🔬 ${data.phWarning}</div>`;
    }
    if (data.conditionWarnings && data.conditionWarnings.length > 0) {
      warningsHtml += data.conditionWarnings.map(w => `<div class="warning-box warn">${w}</div>`).join('');
    }
    if (data.interactionWarning) {
      const cls = data.interactionWarning.severity === 'major' ? 'error' : 'warn';
      warningsHtml += `<div class="warning-box ${cls}">${data.interactionWarning.icon} <strong>Interaksi Pupuk:</strong> ${data.interactionWarning.message}</div>`;
    }
    if (d.isOverMax) {
      warningsHtml += `<div class="warning-box error">⚠️ Dosis telah dibatasi ke maksimum ${d.maxAllowedPerHa} ${d.unit}/ha</div>`;
    }

    const costFormatted = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(data.estimatedCost);

    resultContent.innerHTML = `
      <div class="result-card">
        <div class="result-header">
          <span class="result-icon">🌿</span>
          <h2>Hasil Perhitungan Dosis</h2>
        </div>

        <!-- Summary -->
        <div class="summary-grid">
          <div class="summary-item">
            <span class="value">${d.total} ${d.unit}</span>
            <span class="label">Total Dosis</span>
          </div>
          <div class="summary-item">
            <span class="value">${d.perHectare} ${d.unit}/ha</span>
            <span class="label">Dosis per Hektar</span>
          </div>
          <div class="summary-item">
            <span class="value">${costFormatted}</span>
            <span class="label">Estimasi Biaya</span>
          </div>
        </div>

        <!-- Safety -->
        <div style="margin-bottom:1.25rem;">
          <span class="safety-badge ${s.color}">● ${s.status} (${s.usagePercent}% dari batas maks)</span>
        </div>

        <!-- Dose range -->
        <div class="warning-box success">
          📊 Rentang dosis yang direkomendasikan: <strong>${d.min} — ${d.max} ${d.unit}</strong>
        </div>

        <!-- Warnings -->
        ${warningsHtml}

        <!-- Detail Table -->
        <table class="detail-table" style="margin-top:1.25rem">
          <tr><th colspan="2">Detail Perhitungan</th></tr>
          <tr><td>👨‍🌾 Petani</td><td>${data.farmerName}</td></tr>
          <tr><td>🌿 Tanaman</td><td>${data.plant.name} (${data.plant.category})</td></tr>
          <tr><td>🧪 Pupuk</td><td>${data.fertilizer.name}</td></tr>
          <tr><td>📐 Luas Lahan</td><td>${data.landArea.toLocaleString('id-ID')} m² (${data.landAreaHa} ha)</td></tr>
          <tr><td>📅 Usia Tanam</td><td>${data.plantAge} hari</td></tr>
          <tr><td>🌱 Fase</td><td>${data.phaseLabel} (${data.growthPhase})</td></tr>
          <tr><td>🔬 pH Tanah</td><td>${data.soilPh}</td></tr>
          <tr><th colspan="2">Faktor Penyesuaian</th></tr>
          <tr><td>Faktor Fase</td><td>×${data.factors.phaseFactor}</td></tr>
          <tr><td>Faktor pH</td><td>×${data.factors.phFactor}</td></tr>
          <tr><td>Faktor Kondisi</td><td>×${data.factors.conditionFactor}</td></tr>
          <tr><td>Batas Maks/ha</td><td>${d.maxAllowedPerHa} ${d.unit}/ha</td></tr>
        </table>
      </div>`;

    scrollToResult();
  }

  function renderError(errors) {
    resultSection.style.display = 'block';
    if (resultPlaceholder) resultPlaceholder.style.display = 'none';
    resultContent.innerHTML = `
      <div class="error-card">
        <h2>❌ Validasi Gagal</h2>
        <ul>${errors.map(e => `<li>${e}</li>`).join('')}</ul>
      </div>`;
    scrollToResult();
  }

  function scrollToResult() {
    setTimeout(() => {
      resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
});
