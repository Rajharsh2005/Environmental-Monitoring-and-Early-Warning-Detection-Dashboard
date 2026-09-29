/**
 * AWES & EIN Shared UI, Multi-Node Switching, CSV Auto-Logging & ML Training Engine
 */

const FETCH_CYCLE_SECONDS = 600; // 10 Minutes recording duty cycle
let remainingSeconds = 512;
let lastFetchDate = new Date(Date.now() - (FETCH_CYCLE_SECONDS - remainingSeconds) * 1000);
let nextFetchDate = new Date(lastFetchDate.getTime() + FETCH_CYCLE_SECONDS * 1000);

document.addEventListener('DOMContentLoaded', () => {
  initResponsiveSidebar();
  initNodeSelector();
  initLiveClock();
  initRefreshButton();
  initLiveMicroFluctuations();
  renderCurrentNodeSidebarFooter();
});

/**
 * Toast Notification System
 */
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'success' ? 'toast-success' : type === 'danger' ? 'toast-danger' : ''}`;
  
  const iconSvg = type === 'success' 
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>`
    : type === 'danger'
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;

  toast.innerHTML = `${iconSvg} <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'all 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * Multi-Node Selector Engine (Persists across all 7 pages via localStorage)
 */
function initNodeSelector() {
  const savedNodeId = localStorage.getItem('awes_active_node') || 'OP-01';
  if (AWES_DATA.nodes[savedNodeId]) {
    AWES_DATA.activeNodeId = savedNodeId;
  }

  const selector = document.getElementById('global-node-selector');
  if (selector) {
    selector.value = AWES_DATA.activeNodeId;
    selector.addEventListener('change', (e) => {
      switchActiveNode(e.target.value);
    });
  }

  updateNodeHeaderBadges();
}

function switchActiveNode(nodeId) {
  if (!AWES_DATA.nodes[nodeId]) return;
  AWES_DATA.activeNodeId = nodeId;
  localStorage.setItem('awes_active_node', nodeId);

  updateNodeHeaderBadges();
  renderCurrentNodeSidebarFooter();

  // Dispatch custom event so active page re-renders charts, sensors, and tables
  window.dispatchEvent(new CustomEvent('nodeSwitched', { detail: { nodeId } }));

  const node = AWES_DATA.getActiveNode();
  showToast(`Switched active node to ${node.id} (${node.tag})`, "success");
}

function updateNodeHeaderBadges() {
  const node = AWES_DATA.getActiveNode();
  const badge = document.getElementById('header-node-badge-text');
  if (badge) {
    badge.textContent = `${node.id} ● ONLINE`;
  }

  const selector = document.getElementById('global-node-selector');
  if (selector && selector.value !== node.id) {
    selector.value = node.id;
  }
}

function renderCurrentNodeSidebarFooter() {
  const node = AWES_DATA.getActiveNode();
  const idEl = document.getElementById('sidebar-node-id');
  const typeEl = document.getElementById('sidebar-node-type');
  const fwEl = document.getElementById('sidebar-node-fw');
  const intEl = document.getElementById('sidebar-node-interval');

  if (idEl) idEl.textContent = `CURRENT NODE: ${node.id}`;
  if (typeEl) typeEl.textContent = node.type;
  if (fwEl) fwEl.textContent = node.firmware;
  if (intEl) intEl.textContent = node.interval;
}

/**
 * Time formatting helpers
 */
function formatTimeHHMMSS(date) {
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
}

function formatCountdownMMSS(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function updateSyncHeaderUI() {
  const lastElem = document.getElementById('last-fetch-time');
  const nextElem = document.getElementById('next-fetch-time');
  const countdownElem = document.getElementById('fetch-countdown');
  const syncElem = document.getElementById('last-sync-time');

  const staticLastElem = document.getElementById('static-captured-time');
  const staticNextElem = document.getElementById('static-next-time');
  const staticCountdownElem = document.getElementById('static-countdown-timer');

  const dashStaticLastElem = document.getElementById('dash-static-captured-time');
  const dashStaticCountdownElem = document.getElementById('dash-static-countdown');

  const formattedLast = formatTimeHHMMSS(lastFetchDate);
  const formattedNext = formatTimeHHMMSS(nextFetchDate);
  const formattedCountdown = formatCountdownMMSS(remainingSeconds);

  if (lastElem) lastElem.textContent = formattedLast;
  if (nextElem) nextElem.textContent = formattedNext;
  if (countdownElem) countdownElem.textContent = formattedCountdown;

  if (staticLastElem) staticLastElem.textContent = formattedLast;
  if (staticNextElem) staticNextElem.textContent = formattedNext;
  if (staticCountdownElem) staticCountdownElem.textContent = formattedCountdown;

  if (dashStaticLastElem) dashStaticLastElem.textContent = formattedLast;
  if (dashStaticCountdownElem) dashStaticCountdownElem.textContent = formattedCountdown;
  
  if (syncElem) {
    const elapsed = Math.floor((Date.now() - lastFetchDate.getTime()) / 1000);
    syncElem.textContent = elapsed < 60 ? `${elapsed}s ago` : `${Math.floor(elapsed / 60)}m ago`;
  }
}

/**
 * Live 10-Minute Periodic Duty Cycle Countdown & Auto ML Retraining Loop
 */
function initLiveClock() {
  updateSyncHeaderUI();

  setInterval(() => {
    remainingSeconds--;

    if (remainingSeconds <= 0) {
      executeTenMinuteFetchAndTrainPipeline();
      remainingSeconds = FETCH_CYCLE_SECONDS;
    }

    updateSyncHeaderUI();
  }, 1000);
}

/**
 * 10-Minute Pipeline: Fetch Sensor Data -> Auto-save to CSV Records -> Train ML Model -> Update 10-Min Static Snapshot
 */
function executeTenMinuteFetchAndTrainPipeline() {
  lastFetchDate = new Date();
  nextFetchDate = new Date(lastFetchDate.getTime() + FETCH_CYCLE_SECONDS * 1000);

  const node = AWES_DATA.getActiveNode();
  const timeStr = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(new Date().getDate()).padStart(2,'0')} ${String(new Date().getHours()).padStart(2,'0')}:${String(new Date().getMinutes()).padStart(2,'0')}:00`;
  const timeHHMMSS = formatTimeHHMMSS(lastFetchDate);

  // 1. Generate & Append new simulated 10-minute record for active node & Update 10-Min Static Snapshot
  const newRecId = `REC-${node.id}-${Math.floor(1000 + Math.random()*9000)}`;

  if (node.id === "OP-01") {
    const wVal = (142.3 + Math.random() * 0.4).toFixed(1);
    const mqVal = Math.floor(110 + Math.random() * 5);
    const tVal = (28.30 + Math.random() * 0.30).toFixed(2);
    const hVal = (64.5 + Math.random() * 0.6).toFixed(1);
    const pVal = (1008.18 + Math.random() * 0.05).toFixed(2);
    const vVal = (0.07 + Math.random() * 0.02).toFixed(2);

    node.records.unshift({
      id: newRecId,
      timestamp: timeStr,
      water_level: `${wVal} cm`,
      mq2: mqVal,
      temp: `${tVal} °C`,
      humidity: `${hVal}%`,
      press: `${pVal} hPa`,
      vibration: `${vVal} m/s²`,
      status: "NORMAL"
    });

    if (node.staticSnapshot && node.staticSnapshot.readings) {
      const prevW = parseFloat(node.staticSnapshot.readings.water_level.value) || 142.5;
      const dW = (parseFloat(wVal) - prevW).toFixed(1);
      node.staticSnapshot.capturedTime = timeHHMMSS;
      node.staticSnapshot.readings.water_level.value = wVal;
      node.staticSnapshot.readings.water_level.delta = (dW >= 0 ? `+${dW}` : dW) + " cm";

      const prevMQ = parseInt(node.staticSnapshot.readings.mq2.value) || 112;
      const dMQ = mqVal - prevMQ;
      node.staticSnapshot.readings.mq2.value = String(mqVal);
      node.staticSnapshot.readings.mq2.delta = (dMQ >= 0 ? `+${dMQ}` : `${dMQ}`) + " ADC";

      const prevT = parseFloat(node.staticSnapshot.readings.bme_temp.value) || 28.40;
      const dT = (parseFloat(tVal) - prevT).toFixed(2);
      node.staticSnapshot.readings.bme_temp.value = tVal;
      node.staticSnapshot.readings.bme_temp.delta = (dT >= 0 ? `+${dT}` : dT) + " °C";

      const prevH = parseFloat(node.staticSnapshot.readings.bme_humidity.value) || 64.8;
      const dH = (parseFloat(hVal) - prevH).toFixed(1);
      node.staticSnapshot.readings.bme_humidity.value = hVal;
      node.staticSnapshot.readings.bme_humidity.delta = (dH >= 0 ? `+${dH}` : dH) + " %";

      node.staticSnapshot.readings.bme_press.value = pVal;
      node.staticSnapshot.readings.mpu_vibe.value = vVal;
    }

  } else if (node.id === "EIN-03") {
    const pmVal = (24.2 + Math.random() * 0.6).toFixed(1);
    const wVal = (84.9 + Math.random() * 0.3).toFixed(1);
    const tVal = (29.0 + Math.random() * 0.4).toFixed(1);
    const hVal = (68.2 + Math.random() * 0.6).toFixed(1);
    const windVal = (3.1 + Math.random() * 0.3).toFixed(1);
    const flowVal = (0.41 + Math.random() * 0.03).toFixed(2);

    node.records.unshift({
      id: newRecId,
      timestamp: timeStr,
      pm25: `${pmVal} µg/m³`,
      water_level: `${wVal} cm`,
      temp: `${tVal} °C`,
      rain: "0.0 mm/h",
      soil: "28.4%",
      wind: `${windVal} m/s`,
      status: "NORMAL"
    });

    if (node.staticSnapshot && node.staticSnapshot.readings) {
      node.staticSnapshot.capturedTime = timeHHMMSS;
      node.staticSnapshot.readings.pm25.value = pmVal;
      node.staticSnapshot.readings.pm25.delta = (Math.random() > 0.5 ? "+0.1" : "-0.1") + " µg/m³";
      node.staticSnapshot.readings.water_level.value = wVal;
      node.staticSnapshot.readings.temp.value = tVal;
      node.staticSnapshot.readings.humidity.value = hVal;
      node.staticSnapshot.readings.wind_speed.value = windVal;
      node.staticSnapshot.readings.water_flow.value = flowVal;
    }

  } else {
    const mq2Val = Math.floor(96 + Math.random() * 3);
    const mq5Val = Math.floor(230 + Math.random() * 3);
    const mq135Val = Math.floor(231 + Math.random() * 3);
    const tVal = (26.65 + Math.random() * 0.08).toFixed(2);

    node.records.unshift({
      id: newRecId,
      timestamp: timeStr,
      mq2: mq2Val,
      mq5: mq5Val,
      mq135: mq135Val,
      temp: `${tVal} °C`,
      press: "1001.47 hPa",
      vibration: 0,
      status: "NORMAL"
    });

    if (node.staticSnapshot && node.staticSnapshot.readings) {
      node.staticSnapshot.capturedTime = timeHHMMSS;
      node.staticSnapshot.readings.mq2.value = String(mq2Val);
      node.staticSnapshot.readings.mq5.value = String(mq5Val);
      node.staticSnapshot.readings.mq135.value = String(mq135Val);
      node.staticSnapshot.readings.bmp_temp.value = tVal;
    }
  }

  // Keep records length manageable
  if (node.records.length > 50) node.records.pop();

  // 2. ML Retraining Pipeline Simulation
  AWES_DATA.pipeline.samplesTrainedTotal += 6;
  AWES_DATA.pipeline.modelLoss = +(0.0100 + Math.random() * 0.0030).toFixed(4);
  AWES_DATA.pipeline.lastTrainingTime = timeStr;

  // Re-render UI elements
  window.dispatchEvent(new CustomEvent('pipelineExecuted', { detail: { nodeId: node.id } }));

  showToast(`10-Minute Batch Synchronized: Telemetry logged to CSV & Static Model Buffer updated (Loss: ${AWES_DATA.pipeline.modelLoss})`, "success");
}

/**
 * Manual Refresh Button
 */
function initRefreshButton() {
  const btn = document.getElementById('btn-refresh-data');
  if (!btn) return;

  btn.addEventListener('click', () => {
    btn.classList.add('rotating');
    const node = AWES_DATA.getActiveNode();
    showToast(`Polling live telemetry from ${node.id}...`, "info");

    setTimeout(() => {
      btn.classList.remove('rotating');
      executeTenMinuteFetchAndTrainPipeline();
      remainingSeconds = FETCH_CYCLE_SECONDS;
      updateSyncHeaderUI();
      showToast(`Node ${node.id}: 10-Minute static batch synchronized & ML inference updated.`, "success");
    }, 800);
  });
}

/**
 * Real-Time Sensor Micro-Fluctuations Engine
 * Continously jitters ONLY the LIVE streaming readings every 3.0s,
 * leaving the 10-minute Static Snapshot section 100% frozen.
 */
function initLiveMicroFluctuations() {
  setInterval(() => {
    const node = AWES_DATA.getActiveNode();

    // Iterate over live stream value elements in the DOM
    const liveElems = document.querySelectorAll('.live-stream-reading');
    liveElems.forEach(elem => {
      const key = elem.getAttribute('data-sensor-key');
      if (!key) return;

      if (node.id === "OP-01") {
        if (key === 'water_level') {
          elem.textContent = (142.5 + (Math.random() * 0.4 - 0.2)).toFixed(1);
        } else if (key === 'mq2') {
          elem.textContent = Math.floor(111 + Math.random() * 3);
        } else if (key === 'bme_temp') {
          elem.textContent = (28.40 + (Math.random() * 0.1 - 0.05)).toFixed(2);
        } else if (key === 'bme_humidity') {
          elem.textContent = (64.8 + (Math.random() * 0.4 - 0.2)).toFixed(1);
        } else if (key === 'bme_press') {
          elem.textContent = (1008.20 + (Math.random() * 0.04 - 0.02)).toFixed(2);
        } else if (key === 'mpu_vibe') {
          elem.textContent = (0.08 + (Math.random() * 0.02 - 0.01)).toFixed(2);
        }
      } else if (node.id === "EIN-03") {
        if (key === 'pm25') {
          elem.textContent = (24.5 + (Math.random() * 0.6 - 0.3)).toFixed(1);
        } else if (key === 'pm10') {
          elem.textContent = (48.2 + (Math.random() * 0.8 - 0.4)).toFixed(1);
        } else if (key === 'water_level') {
          elem.textContent = (85.0 + (Math.random() * 0.2 - 0.1)).toFixed(1);
        } else if (key === 'temp') {
          elem.textContent = (29.2 + (Math.random() * 0.2 - 0.1)).toFixed(1);
        } else if (key === 'co2') {
          elem.textContent = Math.floor(414 + Math.random() * 3);
        } else if (key === 'wind_speed') {
          elem.textContent = (3.2 + (Math.random() * 0.4 - 0.2)).toFixed(1);
        }
      } else if (node.id === "AP-02") {
        if (key === 'mq2') {
          elem.textContent = Math.floor(96 + Math.random() * 3);
        } else if (key === 'mq5') {
          elem.textContent = Math.floor(230 + Math.random() * 3);
        } else if (key === 'mq135') {
          elem.textContent = Math.floor(231 + Math.random() * 3);
        } else if (key === 'bmp_temp') {
          elem.textContent = (26.68 + (Math.random() * 0.04 - 0.02)).toFixed(2);
        }
      }
    });
  }, 3000);
}

/**
 * Lightweight SVG Sparkline Generator
 */
function createSparklineSVG(points, color = "#2563EB", fillColor = "rgba(37, 99, 235, 0.08)") {
  if (!points || points.length === 0) return '';
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min === 0 ? 1 : max - min;
  const width = 180;
  const height = 40;
  const pad = 4;

  const coords = points.map((val, idx) => {
    const x = pad + (idx / (points.length - 1)) * (width - 2 * pad);
    const y = height - pad - ((val - min) / range) * (height - 2 * pad);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const linePath = `M ${coords.join(' L ')}`;
  const areaPath = `${linePath} L ${width - pad},${height} L ${pad},${height} Z`;

  return `
    <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
      <path d="${areaPath}" fill="${fillColor}" />
      <path d="${linePath}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="${coords[coords.length - 1].split(',')[0]}" cy="${coords[coords.length - 1].split(',')[1]}" r="3" fill="${color}" stroke="#FFFFFF" stroke-width="1.5" />
    </svg>
  `;
}

/**
 * Responsive Collapsible & Off-Canvas Mobile Sidebar Engine
 */
function initResponsiveSidebar() {
  const toggleBtn = document.getElementById('btn-sidebar-toggle');
  const closeBtn = document.getElementById('btn-sidebar-close');
  const sidebar = document.querySelector('.sidebar');
  
  let backdrop = document.getElementById('sidebar-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'sidebar-backdrop';
    backdrop.className = 'sidebar-backdrop';
    document.body.appendChild(backdrop);
  }

  function openSidebar() {
    if (window.innerWidth <= 1024) {
      if (sidebar) sidebar.classList.add('open');
      if (backdrop) backdrop.classList.add('active');
      document.body.classList.add('sidebar-open');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('sidebar-collapsed');
      localStorage.setItem('awes_sidebar_collapsed', 'false');
    }
  }

  function closeSidebar() {
    if (window.innerWidth <= 1024) {
      if (sidebar) sidebar.classList.remove('open');
      if (backdrop) backdrop.classList.remove('active');
      document.body.classList.remove('sidebar-open');
      document.body.style.overflow = '';
    } else {
      document.body.classList.add('sidebar-collapsed');
      localStorage.setItem('awes_sidebar_collapsed', 'true');
    }
  }

  // Outside hamburger button (opens sidebar when closed)
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openSidebar();
    });
  }

  // Inside hamburger button (closes sidebar when open)
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeSidebar();
    });
  }

  backdrop.addEventListener('click', closeSidebar);

  // Close when pressing Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSidebar();
    }
  });

  // Auto-close sidebar on mobile/tablet when a navigation item is clicked
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 1024) {
        closeSidebar();
      }
    });
  });

  // Restore saved desktop collapsed state preference
  if (window.innerWidth > 1024) {
    const savedCollapsed = localStorage.getItem('awes_sidebar_collapsed');
    if (savedCollapsed === 'true') {
      document.body.classList.add('sidebar-collapsed');
    }
  }

  // Handle window resize dynamically
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) {
      if (sidebar) sidebar.classList.remove('open');
      if (backdrop) backdrop.classList.remove('active');
      document.body.classList.remove('sidebar-open');
      document.body.style.overflow = '';
    }
  });
}
