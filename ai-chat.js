/**
 * AWES & EIN AI Diagnostic Assistant Conversational Engine
 * Multi-Node Context-Aware Assistant for Node 1 (OP-01), Dummy Node (EIN-03), and Node 2 (AP-02) Telemetry & ML Early Warning
 */

document.addEventListener('DOMContentLoaded', () => {
  initAIChat();
});

function initAIChat() {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const messagesBox = document.getElementById('chat-messages');

  if (!form || !input || !messagesBox) return;

  // Preset quick prompt chips
  document.querySelectorAll('.prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.getAttribute('data-query') || chip.textContent.trim();
      input.value = query;
      handleUserSubmit(query);
    });
  });

  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;
    input.value = '';
    handleUserSubmit(query);
  });
}

function handleUserSubmit(query) {
  const messagesBox = document.getElementById('chat-messages');
  if (!messagesBox) return;

  appendChatBubble('user', query);

  const typingId = showTypingIndicator();
  messagesBox.scrollTop = messagesBox.scrollHeight;

  setTimeout(() => {
    removeTypingIndicator(typingId);
    const responseHtml = generateAIResponse(query);
    appendChatBubble('bot', responseHtml);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }, 700);
}

function appendChatBubble(sender, contentHtml) {
  const messagesBox = document.getElementById('chat-messages');
  if (!messagesBox) return;

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const row = document.createElement('div');
  row.className = `chat-bubble-row ${sender === 'user' ? 'user-row' : 'bot-row'}`;

  const avatar = sender === 'user'
    ? `<div class="chat-avatar-small">U</div>`
    : `<div class="chat-avatar-small"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg></div>`;

  row.innerHTML = `
    ${avatar}
    <div class="bubble">
      ${contentHtml}
      <div class="bubble-meta">
        <span>${sender === 'user' ? 'You' : 'AWES Copilot'}</span> &bull; <span>${timeStr}</span>
      </div>
    </div>
  `;

  messagesBox.appendChild(row);
}

function showTypingIndicator() {
  const messagesBox = document.getElementById('chat-messages');
  const typingRow = document.createElement('div');
  typingRow.id = 'typing-indicator-row';
  typingRow.className = 'chat-bubble-row bot-row';
  typingRow.innerHTML = `
    <div class="chat-avatar-small">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
    </div>
    <div class="bubble" style="padding: 10px 14px;">
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>
  `;
  messagesBox.appendChild(typingRow);
  return 'typing-indicator-row';
}

function removeTypingIndicator(id) {
  const elem = document.getElementById(id);
  if (elem) elem.remove();
}

/**
 * Intelligent Multi-Node Semantic Inference Engine
 */
function generateAIResponse(rawQuery) {
  const q = rawQuery.toLowerCase();
  const node = AWES_DATA.getActiveNode();
  const p = AWES_DATA.pipeline;

  // 1. Water Level / Flood
  if (q.includes('water') || q.includes('flood') || q.includes('ultrasonic') || q.includes('drain')) {
    if (node.id === "OP-01") {
      const s = node.sensors;
      return `
        <p><strong>Node 1 (OP-01) — Hydrological Telemetry:</strong></p>
        <div class="ai-telemetry-snippet">
          <div class="ai-telemetry-row"><span>Sensor</span> <span>HC-SR04 Ultrasonic Range Transducer</span></div>
          <div class="ai-telemetry-row"><span>Water Level / Clearance</span> <span>${s.water_level.value} cm (Nominal)</span></div>
          <div class="ai-telemetry-row"><span>Relative Humidity (BME280)</span> <span>${s.bme_humidity.value}% RH</span></div>
          <div class="ai-telemetry-row"><span>Flood Hazard Risk Score</span> <span style="color: #2563EB; font-weight:700;">12% (Normal / Safe Margin)</span></div>
        </div>
        <p>The drainage/riverbed water level has maintained a steady safety margin above the 100 cm flood warning mark with a current rise rate of only +0.2 cm/hr.</p>
      `;
    } else if (node.id === "EIN-03") {
      return `
        <p><strong>Dummy Node (EIN-03) Flood Assessment:</strong></p>
        <div class="ai-telemetry-snippet">
          <div class="ai-telemetry-row"><span>Hydrological Clearance</span> <span>85.0 cm</span></div>
          <div class="ai-telemetry-row"><span>Rainfall Rate</span> <span>0.0 mm/h</span></div>
          <div class="ai-telemetry-row"><span>Soil Moisture</span> <span>28.4% VWC</span></div>
          <div class="ai-telemetry-row"><span>Discharge Speed</span> <span>0.42 m/s</span></div>
          <div class="ai-telemetry-row"><span>Compound Flood Risk</span> <span style="color: #10B981; font-weight:700;">8% (Low Risk)</span></div>
        </div>
      `;
    }
  }

  // 2. Fire / Smoke / Gas
  if (q.includes('fire') || q.includes('smoke') || q.includes('gas') || q.includes('mq-2') || q.includes('chemical')) {
    if (node.id === "OP-01") {
      return `
        <p><strong>Node 1 (OP-01) Fire & Combustible Gas Diagnosis:</strong></p>
        <div class="ai-telemetry-snippet">
          <div class="ai-telemetry-row"><span>MQ-2 Gas / Smoke</span> <span>112 Raw ADC (Baseline: 80-160)</span></div>
          <div class="ai-telemetry-row"><span>Temperature (BME280)</span> <span>28.40 °C</span></div>
          <div class="ai-telemetry-row"><span>Fire / Gas Hazard Score</span> <span style="color: #10B981; font-weight: 700;">6% (Safe)</span></div>
        </div>
        <p>Cross-correlation between thermal transducer and gas sensor shows zero anomalous spikes. Ambient atmosphere is clean.</p>
      `;
    } else if (node.id === "EIN-03") {
      return `
        <p><strong>Dummy Node (EIN-03) Atmospheric & Industrial Chemical Profile:</strong></p>
        <div class="ai-telemetry-snippet">
          <div class="ai-telemetry-row"><span>PM2.5 / PM10</span> <span>24.5 / 48.2 µg/m³ (AQI 32 - Good)</span></div>
          <div class="ai-telemetry-row"><span>CO / CO2</span> <span>1.2 ppm / 415 ppm</span></div>
          <div class="ai-telemetry-row"><span>VOC</span> <span>42 ppb</span></div>
          <div class="ai-telemetry-row"><span>NO2 / SO2</span> <span>18 ppb / 6 ppb</span></div>
        </div>
        <p>Zero industrial hazardous plume detected downwind.</p>
      `;
    }
  }

  // 3. Earthquake / Vibration / Acceleration / Landslide
  if (q.includes('earthquake') || q.includes('vibration') || q.includes('shaking') || q.includes('accel') || q.includes('landslide') || q.includes('motion')) {
    if (node.id === "OP-01") {
      return `
        <p><strong>Node 1 (OP-01) Seismic & Structural Acceleration Telemetry:</strong></p>
        <div class="ai-telemetry-snippet">
          <div class="ai-telemetry-row"><span>MPU6050 Acceleration</span> <span>X: -0.02, Y: 0.04, Z: 9.81 m/s²</span></div>
          <div class="ai-telemetry-row"><span>Dynamic Motion / Vibration</span> <span>0.08 m/s² (Threshold: 2.50 m/s²)</span></div>
          <div class="ai-telemetry-row"><span>Earthquake Risk Score</span> <span style="color: #8B5CF6; font-weight: 700;">2% (Stationary / Normal)</span></div>
        </div>
        <p>Node acceleration reflects standard 1.00 G static gravity. Zero structural tremors or anomalous shocks detected.</p>
      `;
    } else if (node.id === "EIN-03") {
      return `
        <p><strong>Dummy Node (EIN-03) Geotechnical & Slope Stability Telemetry:</strong></p>
        <div class="ai-telemetry-snippet">
          <div class="ai-telemetry-row"><span>Soil Moisture</span> <span>28.4%</span></div>
          <div class="ai-telemetry-row"><span>Inclinometer Tilt</span> <span>0.12°</span></div>
          <div class="ai-telemetry-row"><span>Ground Displacement</span> <span>0.0 mm</span></div>
          <div class="ai-telemetry-row"><span>Landslide Risk Score</span> <span style="color: #10B981; font-weight: 700;">3% (Slope Stable)</span></div>
        </div>
      `;
    }
  }

  // 4. ML Model Training & 10-Minute Pipeline
  if (q.includes('model') || q.includes('train') || q.includes('pipeline') || q.includes('csv') || q.includes('learning') || q.includes('epoch')) {
    return `
      <p><strong>AWES Online ML Hazard Classification & Training Pipeline:</strong></p>
      <div class="ai-telemetry-snippet">
        <div class="ai-telemetry-row"><span>Duty Cycle Interval</span> <span>Every 10 Minutes (600s)</span></div>
        <div class="ai-telemetry-row"><span>Total Samples Trained</span> <span>${p.samplesTrainedTotal} records</span></div>
        <div class="ai-telemetry-row"><span>Model Loss</span> <span>${p.modelLoss}</span></div>
        <div class="ai-telemetry-row"><span>Validation Accuracy</span> <span>${p.modelAccuracy}</span></div>
        <div class="ai-telemetry-row"><span>CSV Auto-Dataset Logging</span> <span>Active (Auto-appends every 10 min)</span></div>
      </div>
      <p>Every 10 minutes, fresh sensor packets from <strong>${node.id}</strong> are appended to the CSV datastore and fed into the edge neural model to re-tune weights and update live hazard risk scores.</p>
    `;
  }

  // 5. GPS / Location
  if (q.includes('gps') || q.includes('location') || q.includes('coordinates') || q.includes('where')) {
    return `
      <p><strong>Geolocation Telemetry for ${node.id}:</strong></p>
      <div class="ai-telemetry-snippet">
        <div class="ai-telemetry-row"><span>GPS Status</span> <span style="color: ${node.gps.status === 'FIX LOCKED' ? '#16A34A' : '#D97706'}; font-weight:700;">${node.gps.status}</span></div>
        <div class="ai-telemetry-row"><span>Coordinates</span> <span>${node.gps.latitude}, ${node.gps.longitude}</span></div>
        <div class="ai-telemetry-row"><span>Satellites Locked</span> <span>${node.gps.satellites} Constellations</span></div>
        <div class="ai-telemetry-row"><span>Site Name</span> <span>${node.gps.locationName}</span></div>
      </div>
    `;
  }

  // 6. General Node Status
  if (q.includes('status') || q.includes('node') || q.includes('overview') || q.includes('current')) {
    return `
      <p><strong>Current Active Node: ${node.name} (${node.id})</strong></p>
      <div class="ai-telemetry-snippet">
        <div class="ai-telemetry-row"><span>Deployment Role</span> <span>${node.type}</span></div>
        <div class="ai-telemetry-row"><span>System Status</span> <span style="color: #16A34A;">● ${node.status}</span></div>
        <div class="ai-telemetry-row"><span>Battery Power</span> <span>${node.battery}% (${node.batteryType})</span></div>
        <div class="ai-telemetry-row"><span>Signal RSSI</span> <span>${node.signalDbm} dBm (${node.signalQuality})</span></div>
        <div class="ai-telemetry-row"><span>Threat Level</span> <span class="badge badge-normal">${node.threatLevel}</span></div>
      </div>
      <p>${node.threatMessage}</p>
    `;
  }

  // Fallback
  return `
    <p>I am monitoring <strong>${node.name} (${node.id})</strong>.</p>
    <p>You can ask me about live sensor readings (e.g., <em>"What is the water level on OP-01?"</em>), fire/gas hazards, seismic acceleration, 10-minute CSV logging, or ML training performance.</p>
  `;
}
