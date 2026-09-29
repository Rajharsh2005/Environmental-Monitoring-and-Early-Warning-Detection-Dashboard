/**
 * AWES & EIN Dynamic Multi-Node Analytics & Trends Chart Controller
 * Adapts line charts and breakdown metrics dynamically to the selected hardware node
 */

let trendsChart = null;

document.addEventListener('DOMContentLoaded', () => {
  initTrendsChart();
  initAnalyticsDropdown();

  // Listen for global node changes & 10-minute pipeline retraining updates
  window.addEventListener('nodeSwitched', () => {
    updateChartForActiveNode();
    renderMiniBreakdownCards();
  });

  window.addEventListener('pipelineExecuted', () => {
    updateChartForActiveNode();
    renderMiniBreakdownCards();
  });
});

function initTrendsChart() {
  const ctx = document.getElementById('sensorTrendsChart');
  if (!ctx || typeof Chart === 'undefined') return;

  const node = AWES_DATA.getActiveNode();
  const config = getChartConfigForNode(node);

  trendsChart = new Chart(ctx, config);
  renderMiniBreakdownCards();
}

function getChartConfigForNode(node) {
  const t = node.trend1Hour;

  let datasets = [];
  let yTitle = 'Sensor Values';

  if (node.id === "OP-01") {
    yTitle = 'Telemetry Units';
    datasets = [
      {
        label: 'Ultrasonic Water Level (cm)',
        data: t.waterLevel,
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.05)',
        borderWidth: 2.5,
        tension: 0.3,
        fill: true
      },
      {
        label: 'MQ-2 Gas / Smoke (ADC)',
        data: t.mq2,
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.05)',
        borderWidth: 2.5,
        tension: 0.3,
        fill: true
      },
      {
        label: 'Humidity (% RH)',
        data: t.humidity,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderWidth: 2.5,
        tension: 0.3,
        fill: true
      }
    ];
  } else if (node.id === "EIN-03") {
    yTitle = 'Environmental Units';
    datasets = [
      {
        label: 'PM2.5 Fine Particulate (µg/m³)',
        data: t.pm25,
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        borderWidth: 2.5,
        tension: 0.3,
        fill: true
      },
      {
        label: 'Hydrological Water Level (cm)',
        data: t.waterLevel,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        borderWidth: 2.5,
        tension: 0.3,
        fill: true
      },
      {
        label: 'Soil Moisture (% VWC)',
        data: t.soil,
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.05)',
        borderWidth: 2.5,
        tension: 0.3,
        fill: true
      }
    ];
  } else {
    // AP-02
    yTitle = 'Raw ADC Value';
    datasets = [
      {
        label: 'MQ-2 (Smoke / Combustible)',
        data: t.mq2,
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.05)',
        borderWidth: 2.5,
        tension: 0.3,
        fill: true
      },
      {
        label: 'MQ-5 (LPG / Natural Gas)',
        data: t.mq5,
        borderColor: '#16A34A',
        backgroundColor: 'rgba(22, 163, 74, 0.05)',
        borderWidth: 2.5,
        tension: 0.3,
        fill: true
      },
      {
        label: 'MQ-135 (Air Quality Gas)',
        data: t.mq135,
        borderColor: '#D97706',
        backgroundColor: 'rgba(217, 119, 6, 0.05)',
        borderWidth: 2.5,
        tension: 0.3,
        fill: true
      }
    ];
  }

  return {
    type: 'line',
    data: {
      labels: t.timestamps,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 8,
            font: { family: "'Inter', sans-serif", size: 12, weight: '600' },
            color: '#475569',
            padding: 16
          }
        },
        tooltip: {
          backgroundColor: '#FFFFFF',
          titleColor: '#0F172A',
          bodyColor: '#334155',
          borderColor: '#E2E8F0',
          borderWidth: 1,
          padding: 12,
          usePointStyle: true
        }
      },
      scales: {
        x: { grid: { color: '#F1F5F9' }, ticks: { color: '#64748B' } },
        y: {
          title: { display: true, text: yTitle, color: '#64748B', font: { weight: '600' } },
          grid: { color: '#F1F5F9' },
          ticks: { color: '#64748B' }
        }
      }
    }
  };
}

function updateChartForActiveNode() {
  if (!trendsChart) return;
  const node = AWES_DATA.getActiveNode();
  const config = getChartConfigForNode(node);

  trendsChart.data = config.data;
  trendsChart.options = config.options;
  trendsChart.update();

  updateDropdownOptionsForNode(node);
}

function updateDropdownOptionsForNode(node) {
  const select = document.getElementById('sensor-select-filter');
  if (!select) return;

  if (node.id === "OP-01") {
    select.innerHTML = `
      <option value="all">All Node 1 Channels (Water Level, Gas, Humidity)</option>
      <option value="water">Ultrasonic Water Level (cm)</option>
      <option value="mq2">MQ-2 Combustible Gas (ADC)</option>
      <option value="temp_hum">Temperature & Humidity (BME280)</option>
    `;
  } else if (node.id === "EIN-03") {
    select.innerHTML = `
      <option value="all">All Dummy Node Channels (PM2.5, Water, Soil)</option>
      <option value="pm">Particulate Matter (PM2.5 / PM10)</option>
      <option value="hydro">Hydrology (Water Level & Rain)</option>
      <option value="geo">Geotechnical (Soil & Tilt)</option>
    `;
  } else {
    select.innerHTML = `
      <option value="all">All Gas Sensors (MQ-2, MQ-5, MQ-135)</option>
      <option value="mq2">MQ-2 (Smoke / Combustible)</option>
      <option value="mq5">MQ-5 (LPG / Natural Gas)</option>
      <option value="mq135">MQ-135 (Air Quality)</option>
    `;
  }
}

function initAnalyticsDropdown() {
  const select = document.getElementById('sensor-select-filter');
  if (!select) return;

  updateDropdownOptionsForNode(AWES_DATA.getActiveNode());

  select.addEventListener('change', () => {
    updateChartForActiveNode();
  });
}

function renderMiniBreakdownCards() {
  const container = document.getElementById('analytics-breakdown-container');
  if (!container) return;

  const node = AWES_DATA.getActiveNode();

  if (node.id === "OP-01") {
    container.innerHTML = `
      <div class="card">
        <span class="sensor-code-badge">HC-SR04</span>
        <h3 style="font-size: 14.5px; font-weight: 700; margin-top: 4px;">Ultrasonic Water Level</h3>
        <div style="font-size: 26px; font-weight: 800; color: #2563EB; margin: 8px 0;">142.5 <span style="font-size: 13px; color: var(--text-muted);">cm</span></div>
        <div style="font-size: 11.5px; color: var(--text-muted);">Flood Alert Margin: <strong>+42.5 cm above danger threshold</strong></div>
      </div>
      <div class="card">
        <span class="sensor-code-badge">MQ-2</span>
        <h3 style="font-size: 14.5px; font-weight: 700; margin-top: 4px;">Combustible Gas / Smoke</h3>
        <div style="font-size: 26px; font-weight: 800; color: #F59E0B; margin: 8px 0;">112 <span style="font-size: 13px; color: var(--text-muted);">ADC</span></div>
        <div style="font-size: 11.5px; color: var(--text-muted);">Fire Cross-Check: <strong>Normal Baseline (80-160)</strong></div>
      </div>
      <div class="card">
        <span class="sensor-code-badge">MPU6050</span>
        <h3 style="font-size: 14.5px; font-weight: 700; margin-top: 4px;">Seismic Vibration Index</h3>
        <div style="font-size: 26px; font-weight: 800; color: #8B5CF6; margin: 8px 0;">0.08 <span style="font-size: 13px; color: var(--text-muted);">m/s²</span></div>
        <div style="font-size: 11.5px; color: var(--text-muted);">Earthquake Status: <strong>Zero Anomalous Tremor</strong></div>
      </div>
    `;
  } else if (node.id === "EIN-03") {
    container.innerHTML = `
      <div class="card">
        <span class="sensor-code-badge">AIR-AQI</span>
        <h3 style="font-size: 14.5px; font-weight: 700; margin-top: 4px;">Particulate PM2.5</h3>
        <div style="font-size: 26px; font-weight: 800; color: #EF4444; margin: 8px 0;">24.5 <span style="font-size: 13px; color: var(--text-muted);">µg/m³</span></div>
        <div style="font-size: 11.5px; color: var(--text-muted);">Pollution Index: <strong>Good (Clean Air Quality)</strong></div>
      </div>
      <div class="card">
        <span class="sensor-code-badge">HYDRO</span>
        <h3 style="font-size: 14.5px; font-weight: 700; margin-top: 4px;">Hydrological Clearance</h3>
        <div style="font-size: 26px; font-weight: 800; color: #3B82F6; margin: 8px 0;">85.0 <span style="font-size: 13px; color: var(--text-muted);">cm</span></div>
        <div style="font-size: 11.5px; color: var(--text-muted);">Flood Risk Model: <strong>8% (Low Risk)</strong></div>
      </div>
      <div class="card">
        <span class="sensor-code-badge">GEOTECH</span>
        <h3 style="font-size: 14.5px; font-weight: 700; margin-top: 4px;">Soil Moisture & Tilt</h3>
        <div style="font-size: 26px; font-weight: 800; color: #8B5CF6; margin: 8px 0;">28.4% <span style="font-size: 13px; color: var(--text-muted);">/ 0.12°</span></div>
        <div style="font-size: 11.5px; color: var(--text-muted);">Landslide Stability: <strong>Slope Secure</strong></div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="card">
        <span class="sensor-code-badge">MQ-2</span>
        <h3 style="font-size: 14.5px; font-weight: 700; margin-top: 4px;">Smoke / Combustible</h3>
        <div style="font-size: 26px; font-weight: 800; color: #2563EB; margin: 8px 0;">97 <span style="font-size: 13px; color: var(--text-muted);">ADC</span></div>
        <div style="font-size: 11.5px; color: var(--text-muted);">Baseline Range: <strong>70 – 130 ADC</strong></div>
      </div>
      <div class="card">
        <span class="sensor-code-badge">MQ-5</span>
        <h3 style="font-size: 14.5px; font-weight: 700; margin-top: 4px;">LPG / Natural Gas</h3>
        <div style="font-size: 26px; font-weight: 800; color: #16A34A; margin: 8px 0;">231 <span style="font-size: 13px; color: var(--text-muted);">ADC</span></div>
        <div style="font-size: 11.5px; color: var(--text-muted);">Baseline Range: <strong>180 – 260 ADC</strong></div>
      </div>
      <div class="card">
        <span class="sensor-code-badge">MQ-135</span>
        <h3 style="font-size: 14.5px; font-weight: 700; margin-top: 4px;">Air Quality Gas</h3>
        <div style="font-size: 26px; font-weight: 800; color: #D97706; margin: 8px 0;">232 <span style="font-size: 13px; color: var(--text-muted);">ADC</span></div>
        <div style="font-size: 11.5px; color: var(--text-muted);">Baseline Range: <strong>190 – 270 ADC</strong></div>
      </div>
    `;
  }
}
