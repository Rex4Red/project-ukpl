/**
 * MedDose — Frontend Application
 * Handles form interaction, API calls, result display, and history.
 */

(function () {
  'use strict';

  // ==================== CONFIG ====================
  const API_BASE = '/api/calculate';

  // ==================== STATE ====================
  let drugData = [];
  let interactionData = [];
  let calculationHistory = [];

  // ==================== DOM ELEMENTS ====================
  const form = document.getElementById('dosage-form');
  const patientNameInput = document.getElementById('patient-name');
  const weightInput = document.getElementById('weight');
  const ageInput = document.getElementById('age');
  const drugSelect = document.getElementById('drug-select');
  const frequencySelect = document.getElementById('frequency-select');
  const interactionSelect = document.getElementById('interaction-select');
  const btnCalculate = document.getElementById('btn-calculate');
  const btnReset = document.getElementById('btn-reset');
  const resultSection = document.getElementById('result-section');
  const resultCard = document.getElementById('result-card');
  const resultStatusBadge = document.getElementById('result-status-badge');
  const resultDoseNumber = document.getElementById('result-dose-number');
  const resultDoseUnit = document.getElementById('result-dose-unit');
  const resultDetails = document.getElementById('result-details');
  const resultWarnings = document.getElementById('result-warnings');
  const drugInfoBanner = document.getElementById('drug-info-banner');
  const drugInfoTitle = document.getElementById('drug-info-title');
  const drugInfoText = document.getElementById('drug-info-text');
  const historyBody = document.getElementById('history-body');
  const historyEmpty = document.getElementById('history-empty');

  // ==================== INIT ====================
  async function init() {
    initDarkMode();
    await loadDrugData();
    loadHistoryFromStorage();
    setupEventListeners();
    autoSelectAgeCategory();
  }

  // ==================== DARK MODE ====================
  function initDarkMode() {
    const btnDarkMode = document.getElementById('btn-dark-mode');
    const savedTheme = localStorage.getItem('meddose-theme');

    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      btnDarkMode.querySelector('.material-symbols-outlined').textContent = 'light_mode';
    }

    btnDarkMode.addEventListener('click', function () {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        btnDarkMode.querySelector('.material-symbols-outlined').textContent = 'dark_mode';
        localStorage.setItem('meddose-theme', 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        btnDarkMode.querySelector('.material-symbols-outlined').textContent = 'light_mode';
        localStorage.setItem('meddose-theme', 'dark');
      }
    });
  }

  // ==================== DATA LOADING ====================
  async function loadDrugData() {
    try {
      const response = await fetch(API_BASE);
      const json = await response.json();

      if (json.success) {
        drugData = json.data.drugs;
        interactionData = json.data.interactions;
        populateDrugSelect();
        populateInteractionSelect();
      }
    } catch (error) {
      console.error('Failed to load drug data:', error);
      // Fallback: populate with hardcoded data
      populateDrugSelectFallback();
    }
  }

  function populateDrugSelect() {
    drugSelect.innerHTML = '<option value="">Pilih Obat...</option>';
    drugData.forEach(function (drug) {
      const option = document.createElement('option');
      option.value = drug.id;
      option.textContent = drug.name + ' — ' + drug.category;
      drugSelect.appendChild(option);
    });
  }

  function populateDrugSelectFallback() {
    const drugs = [
      { id: 'paracetamol', name: 'Paracetamol', category: 'Analgesik' },
      { id: 'amoxicillin', name: 'Amoxicillin', category: 'Antibiotik' },
      { id: 'ibuprofen', name: 'Ibuprofen', category: 'NSAID' },
      { id: 'metformin', name: 'Metformin', category: 'Antidiabetes' },
      { id: 'omeprazole', name: 'Omeprazole', category: 'PPI' },
      { id: 'cetirizine', name: 'Cetirizine', category: 'Antihistamin' }
    ];
    drugSelect.innerHTML = '<option value="">Pilih Obat...</option>';
    drugs.forEach(function (drug) {
      const option = document.createElement('option');
      option.value = drug.id;
      option.textContent = drug.name + ' — ' + drug.category;
      drugSelect.appendChild(option);
    });
  }

  function populateInteractionSelect() {
    interactionSelect.innerHTML = '';
    interactionData.forEach(function (item) {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = item.name;
      interactionSelect.appendChild(option);
    });
  }

  // ==================== EVENT LISTENERS ====================
  function setupEventListeners() {
    form.addEventListener('submit', handleSubmit);
    btnReset.addEventListener('click', handleReset);
    drugSelect.addEventListener('change', handleDrugChange);
    ageInput.addEventListener('input', autoSelectAgeCategory);
  }

  function autoSelectAgeCategory() {
    const age = parseFloat(ageInput.value);
    if (isNaN(age) || age < 0) return;

    let category = 'dewasa';
    if (age < 1) category = 'bayi';
    else if (age < 12) category = 'anak';
    else if (age < 18) category = 'remaja';
    else if (age < 65) category = 'dewasa';
    else category = 'lansia';

    const radios = document.querySelectorAll('input[name="age-category"]');
    radios.forEach(function (radio) {
      radio.checked = radio.value === category;
    });
  }

  function handleDrugChange() {
    const drugId = drugSelect.value;
    const drug = drugData.find(function (d) { return d.id === drugId; });

    // Update frequency options
    frequencySelect.innerHTML = '<option value="">Pilih frekuensi...</option>';

    if (drug) {
      drug.allowedFrequencies.forEach(function (freq) {
        const option = document.createElement('option');
        option.value = freq;
        const dosesPerDay = Math.floor(24 / freq);
        option.textContent = 'Tiap ' + freq + ' jam (' + dosesPerDay + 'x sehari)';
        frequencySelect.appendChild(option);
      });

      // Show drug info banner
      drugInfoTitle.textContent = 'Standar Dosis (' + drug.name + ')';
      drugInfoText.textContent =
        drug.dosePerKg.min + '-' + drug.dosePerKg.max + ' ' + drug.unit +
        '/kgBB per pemberian. Frekuensi: tiap ' +
        drug.allowedFrequencies.join('/') + ' jam.';
      drugInfoBanner.classList.remove('hidden');
    } else {
      drugInfoBanner.classList.add('hidden');
    }
  }

  // ==================== FORM SUBMISSION ====================
  async function handleSubmit(e) {
    e.preventDefault();

    // Gather form data
    const ageCategory = document.querySelector('input[name="age-category"]:checked');
    const conditionCheckboxes = document.querySelectorAll('input[name="conditions"]:checked');
    const conditions = Array.from(conditionCheckboxes).map(function (cb) { return cb.value; });

    const payload = {
      patientName: patientNameInput.value.trim(),
      weight: parseFloat(weightInput.value),
      age: parseFloat(ageInput.value),
      ageCategory: ageCategory ? ageCategory.value : null,
      drugId: drugSelect.value,
      frequency: parseInt(frequencySelect.value),
      conditions: conditions,
      interactingDrug: interactionSelect.value
    };

    // Disable button
    btnCalculate.disabled = true;
    btnCalculate.innerHTML = '<span class="loading-spinner"></span> Menghitung...';

    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        displayResult(result.data);
        addToHistory(result.data);
      } else {
        displayErrors(result.errors);
      }
    } catch (error) {
      console.error('API Error:', error);
      displayErrors(['Gagal terhubung ke server. Pastikan server berjalan.']);
    } finally {
      btnCalculate.disabled = false;
      btnCalculate.innerHTML = '<span class="btn-icon">💊</span> Hitung Dosis';
    }
  }

  // ==================== DISPLAY RESULT ====================
  function displayResult(data) {
    resultSection.classList.remove('hidden');

    // Reset animation
    resultCard.classList.remove('animate-fade-in-up');
    void resultCard.offsetWidth;
    resultCard.classList.add('animate-fade-in-up');

    // Status badge
    const statusLower = data.status.toLowerCase();
    resultStatusBadge.className = 'status-badge ' + statusLower;

    let statusIcon = '🟢';
    if (statusLower === 'perhatian') statusIcon = '🟡';
    else if (statusLower === 'peringatan') statusIcon = '🟠';
    else if (statusLower === 'bahaya') statusIcon = '🔴';
    resultStatusBadge.innerHTML = '<span>' + statusIcon + '</span> ' + data.status;

    // Result card border color
    resultCard.className = 'card result-card animate-fade-in-up status-' + statusLower;

    // Dose display
    resultDoseNumber.textContent = data.dosePerAdministration;
    resultDoseUnit.textContent = data.unit;

    // Detail rows
    const marginClass = data.marginPercentage > 50 ? 'safe' : data.marginPercentage > 20 ? 'warning' : 'danger';

    resultDetails.innerHTML =
      createDetailRow('Dosis per pemberian', data.dosePerAdministration + ' ' + data.unit) +
      createDetailRow('Frekuensi', data.frequencyLabel) +
      createDetailRow('Total per hari', data.totalDailyDose + ' ' + data.unit) +
      createDetailRow('Dosis Maksimal/Hari', data.maxDailyDose + ' ' + data.unit) +
      createDetailRow('Sisa Margin', data.remainingMargin + ' ' + data.unit + ' (' + data.marginPercentage + '%)', marginClass) +
      createDetailRow('Kategori Usia', data.ageCategory);

    // Warnings
    resultWarnings.innerHTML = '';
    if (data.warnings && data.warnings.length > 0) {
      data.warnings.forEach(function (warning) {
        resultWarnings.appendChild(createWarningBanner(warning));
      });
    }

    // Scroll to result
    setTimeout(function () {
      resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  function createDetailRow(label, value, valueClass) {
    const cls = valueClass ? ' ' + valueClass : '';
    return '<div class="detail-row">' +
      '<span class="detail-label">' + label + '</span>' +
      '<span class="detail-value' + cls + '">' + value + '</span>' +
      '</div>';
  }

  function createWarningBanner(warning) {
    const banner = document.createElement('div');
    let bannerClass = 'info';
    let icon = 'ℹ️';

    if (warning.type === 'danger') {
      bannerClass = 'danger';
      icon = '🚨';
    } else if (warning.type === 'warning') {
      bannerClass = 'warning';
      icon = '⚠️';
    } else if (warning.type === 'success' || warning.type === 'safe') {
      bannerClass = 'success';
      icon = '✅';
    }

    banner.className = 'info-banner ' + bannerClass;
    banner.innerHTML =
      '<span class="banner-icon">' + icon + '</span>' +
      '<div><p class="banner-text text-body-sm">' + warning.message + '</p></div>';

    return banner;
  }

  function displayErrors(errors) {
    resultSection.classList.remove('hidden');
    resultCard.classList.remove('animate-fade-in-up');
    void resultCard.offsetWidth;
    resultCard.classList.add('animate-fade-in-up');

    resultCard.className = 'card result-card animate-fade-in-up status-bahaya';
    resultStatusBadge.className = 'status-badge bahaya';
    resultStatusBadge.innerHTML = '<span>🔴</span> ERROR';

    resultDoseNumber.textContent = '—';
    resultDoseUnit.textContent = '';
    resultDetails.innerHTML = '';

    resultWarnings.innerHTML = '';
    const errorList = document.createElement('ul');
    errorList.className = 'error-list';
    errors.forEach(function (err) {
      const li = document.createElement('li');
      li.textContent = err;
      errorList.appendChild(li);
    });
    resultWarnings.appendChild(errorList);

    setTimeout(function () {
      resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  // ==================== HISTORY ====================
  function addToHistory(data) {
    const entry = {
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      patient: data.patientName,
      drug: data.drug,
      dose: data.dosePerAdministration + ' ' + data.unit,
      status: data.status
    };

    calculationHistory.unshift(entry);

    // Keep only last 20
    if (calculationHistory.length > 20) {
      calculationHistory = calculationHistory.slice(0, 20);
    }

    saveHistoryToStorage();
    renderHistory();
  }

  function renderHistory() {
    historyBody.innerHTML = '';

    if (calculationHistory.length === 0) {
      historyEmpty.classList.remove('hidden');
      return;
    }

    historyEmpty.classList.add('hidden');

    calculationHistory.forEach(function (entry, index) {
      const tr = document.createElement('tr');
      if (index === 0) {
        tr.style.animation = 'fadeInUp 0.3s ease-out';
      }

      let statusIcon = '✅';
      if (entry.status === 'PERHATIAN') statusIcon = '🟡';
      else if (entry.status === 'PERINGATAN') statusIcon = '🟠';
      else if (entry.status === 'BAHAYA') statusIcon = '🔴';

      tr.innerHTML =
        '<td>' + entry.time + '</td>' +
        '<td>' + escapeHtml(entry.patient) + '</td>' +
        '<td>' + escapeHtml(entry.drug) + '</td>' +
        '<td><strong>' + entry.dose + '</strong></td>' +
        '<td>' + statusIcon + ' ' + entry.status + '</td>';

      historyBody.appendChild(tr);
    });
  }

  function saveHistoryToStorage() {
    try {
      localStorage.setItem('meddose-history', JSON.stringify(calculationHistory));
    } catch (e) {
      // localStorage not available
    }
  }

  function loadHistoryFromStorage() {
    try {
      const stored = localStorage.getItem('meddose-history');
      if (stored) {
        calculationHistory = JSON.parse(stored);
        renderHistory();
      }
    } catch (e) {
      calculationHistory = [];
    }
  }

  // ==================== RESET ====================
  function handleReset() {
    form.reset();
    resultSection.classList.add('hidden');
    drugInfoBanner.classList.add('hidden');
    frequencySelect.innerHTML = '<option value="">Pilih frekuensi...</option>';

    // Reset age category to dewasa
    const dewasaRadio = document.querySelector('input[name="age-category"][value="dewasa"]');
    if (dewasaRadio) dewasaRadio.checked = true;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==================== UTILITIES ====================
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ==================== START ====================
  document.addEventListener('DOMContentLoaded', init);

})();
