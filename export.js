/**
 * AWES & EIN Dynamic Multi-Node Historical Telemetry Records & CSV Exporter
 * Generates RFC-4180 CSV datasets reflecting the active hardware node
 */

document.addEventListener('DOMContentLoaded', () => {
  renderHistoryTable();
  initExportButton();
  initSearchFilter();

  window.addEventListener('nodeSwitched', () => {
    renderHistoryTable();
  });

  window.addEventListener('pipelineExecuted', () => {
    renderHistoryTable();
  });
});

function renderHistoryTable(filterText = '') {
  const thead = document.getElementById('history-table-head');
  const tbody = document.getElementById('history-table-body');
  if (!tbody) return;

  const node = AWES_DATA.getActiveNode();

  // Dynamic headers per node
  if (thead) {
    if (node.id === "OP-01") {
      thead.innerHTML = `
        <tr>
          <th>Record ID</th>
          <th>Timestamp (UTC+5:30)</th>
          <th>Water Level (Ultrasonic)</th>
          <th>MQ-2 (Gas/Smoke)</th>
          <th>Temperature</th>
          <th>Humidity</th>
          <th>Pressure</th>
          <th>Vibration</th>
          <th>Hazard Status</th>
        </tr>
      `;
    } else if (node.id === "EIN-03") {
      thead.innerHTML = `
        <tr>
          <th>Record ID</th>
          <th>Timestamp (UTC+5:30)</th>
          <th>PM2.5 (Fine Particulate)</th>
          <th>Water Level</th>
          <th>Temperature</th>
          <th>Rainfall</th>
          <th>Soil Moisture</th>
          <th>Wind Speed</th>
          <th>Hazard Status</th>
        </tr>
      `;
    } else {
      thead.innerHTML = `
        <tr>
          <th>Record ID</th>
          <th>Timestamp (UTC+5:30)</th>
          <th>MQ-2 (Smoke)</th>
          <th>MQ-5 (LPG)</th>
          <th>MQ-135 (Air)</th>
          <th>Temperature</th>
          <th>Pressure</th>
          <th>Vibration</th>
          <th>Hazard Status</th>
        </tr>
      `;
    }
  }

  const records = node.records.filter(rec => {
    if (!filterText) return true;
    const q = filterText.toLowerCase();
    return rec.timestamp.toLowerCase().includes(q) ||
           rec.id.toLowerCase().includes(q) ||
           rec.status.toLowerCase().includes(q);
  });

  if (records.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 24px; color: var(--text-muted);">
          No telemetry records matching filter criteria.
        </td>
      </tr>
    `;
    return;
  }

  if (node.id === "OP-01") {
    tbody.innerHTML = records.map(rec => `
      <tr>
        <td><span style="font-family: monospace; font-weight: 600; color: var(--text-muted);">${rec.id}</span></td>
        <td><strong>${rec.timestamp}</strong></td>
        <td><span class="badge" style="background:#EFF6FF; color:#1E40AF; border:1px solid #BFDBFE;">${rec.water_level}</span></td>
        <td><span class="badge badge-neutral">${rec.mq2} ADC</span></td>
        <td>${rec.temp}</td>
        <td>${rec.humidity}</td>
        <td>${rec.press}</td>
        <td>${rec.vibration}</td>
        <td><span class="badge badge-normal">${rec.status}</span></td>
      </tr>
    `).join('');
  } else if (node.id === "EIN-03") {
    tbody.innerHTML = records.map(rec => `
      <tr>
        <td><span style="font-family: monospace; font-weight: 600; color: var(--text-muted);">${rec.id}</span></td>
        <td><strong>${rec.timestamp}</strong></td>
        <td><span class="badge" style="background:#FEF2F2; color:#991B1B; border:1px solid #FECACA;">${rec.pm25}</span></td>
        <td><span class="badge" style="background:#EFF6FF; color:#1E40AF; border:1px solid #BFDBFE;">${rec.water_level}</span></td>
        <td>${rec.temp}</td>
        <td>${rec.rain}</td>
        <td>${rec.soil}</td>
        <td>${rec.wind}</td>
        <td><span class="badge badge-normal">${rec.status}</span></td>
      </tr>
    `).join('');
  } else {
    tbody.innerHTML = records.map(rec => `
      <tr>
        <td><span style="font-family: monospace; font-weight: 600; color: var(--text-muted);">${rec.id}</span></td>
        <td><strong>${rec.timestamp}</strong></td>
        <td><span class="badge badge-neutral">${rec.mq2}</span></td>
        <td><span class="badge badge-neutral">${rec.mq5}</span></td>
        <td><span class="badge badge-neutral">${rec.mq135}</span></td>
        <td>${rec.temp}</td>
        <td>${rec.press}</td>
        <td>${rec.vibration}</td>
        <td><span class="badge badge-normal">${rec.status}</span></td>
      </tr>
    `).join('');
  }
}

function initSearchFilter() {
  const searchInput = document.getElementById('history-search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    renderHistoryTable(e.target.value.trim());
  });
}

function initExportButton() {
  const btn = document.getElementById('btn-export-csv');
  if (!btn) return;

  btn.addEventListener('click', () => {
    exportActiveNodeCSV();
  });
}

/**
 * Real RFC-4180 CSV Dataset Exporter
 */
function exportActiveNodeCSV() {
  const node = AWES_DATA.getActiveNode();
  const records = node.records;

  let headers = [];
  let rows = [];

  if (node.id === "OP-01") {
    headers = ["Record ID", "Timestamp (UTC+5:30)", "Water Level (cm)", "MQ-2 Gas (Raw ADC)", "Temperature (C)", "Humidity (%RH)", "Pressure (hPa)", "Vibration (m/s2)", "Hazard Status"];
    records.forEach(r => {
      rows.push([
        r.id,
        `"${r.timestamp}"`,
        r.water_level.replace(' cm', ''),
        r.mq2,
        r.temp.replace(' °C', ''),
        r.humidity.replace('%', ''),
        r.press.replace(' hPa', ''),
        r.vibration.replace(' m/s²', ''),
        r.status
      ].join(','));
    });
  } else if (node.id === "EIN-03") {
    headers = ["Record ID", "Timestamp (UTC+5:30)", "PM2.5 (ug/m3)", "Water Level (cm)", "Temperature (C)", "Rainfall (mm/h)", "Soil Moisture (%)", "Wind Speed (m/s)", "Hazard Status"];
    records.forEach(r => {
      rows.push([
        r.id,
        `"${r.timestamp}"`,
        r.pm25.replace(' µg/m³', ''),
        r.water_level.replace(' cm', ''),
        r.temp.replace(' °C', ''),
        r.rain.replace(' mm/h', ''),
        r.soil.replace('%', ''),
        r.wind.replace(' m/s', ''),
        r.status
      ].join(','));
    });
  } else {
    headers = ["Record ID", "Timestamp (UTC+5:30)", "MQ-2 Smoke (Raw ADC)", "MQ-5 LPG (Raw ADC)", "MQ-135 Air (Raw ADC)", "Temperature (C)", "Pressure (hPa)", "Vibration (Raw)", "Threat Status"];
    records.forEach(r => {
      rows.push([
        r.id,
        `"${r.timestamp}"`,
        r.mq2,
        r.mq5,
        r.mq135,
        r.temp.replace(' °C', ''),
        r.press.replace(' hPa', ''),
        r.vibration,
        r.status
      ].join(','));
    });
  }

  const csvRows = [
    `# AWES & Environmental Intelligence Network (EIN)`,
    `# Hardware Node: ${node.id} (${node.name})`,
    `# Tag: ${node.tag} | Firmware: ${node.firmware} | 10-Min Duty Cycle`,
    `# Total Samples in Log: ${records.length} | ML Model Loss: ${AWES_DATA.pipeline.modelLoss}`,
    `# Export Generated: ${new Date().toISOString()}`,
    `# -------------------------------------------------------------`,
    headers.join(','),
    ...rows
  ];

  const csvString = csvRows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `AWES_${node.id}_Telemetry_Dataset_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast(`CSV Dataset Downloaded: ${node.id} (${records.length} 10-min records)`, 'success');
}
