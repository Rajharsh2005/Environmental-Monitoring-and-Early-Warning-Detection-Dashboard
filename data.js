/**
 * AWES & Environmental Intelligence Network (EIN) Central Data Store
 * Supports 3 Multi-Hazard Hardware Nodes:
 *  1. AP-02: Node 2 (Baseline Gas & Anomaly)
 *  2. OP-01: Node 1 (Ultrasonic Flood, MQ-2 Fire/Gas, BME280, MPU6050 Earthquake/Vibration)
 *  3. EIN-03: Dummy Node (Flood, Fire, Air Pollution, Extreme Heat, Landslide, Industrial Chemical Leak)
 */

const AWES_DATA = {
  activeNodeId: "OP-01", // Default active node (can be switched dynamically)

  // 10-Minute Periodic Duty Cycle & ML Retraining State
  pipeline: {
    intervalSeconds: 600, // 10 Minutes
    lastTrainingEpoch: "Epoch #142 (Completed at last 10-min cycle)",
    lastTrainingTime: "2026-09-04 10:40:00",
    nextTrainingTime: "2026-09-04 10:50:00",
    samplesTrainedTotal: 2880,
    modelLoss: 0.0118,
    modelAccuracy: "99.6%",
    trainingStatus: "IDLE (Next online retrain in 10 min)",
    autoSaveCSV: true
  },

  nodes: {
    // =========================================================================
    // NODE 1: OP-01 (Node 1 — Ultrasonic, GPS, MQ-2, BME280, MPU6050)
    // =========================================================================
    "OP-01": {
      id: "OP-01",
      name: "Node 1 (OP-01)",
      tag: "NODE 1",
      status: "OFFLINE",
      type: "Node 1 Multi-Hazard Station",
      firmware: "v2.1.4-PROD",
      interval: "10 Minutes",
      battery: 88,
      batteryType: "LiFePO4 Solar Buffered (Hardware Monitored)",
      signalDbm: -58,
      signalQuality: "Excellent (4G LTE + LoRa Failover)",
      gps: {
        status: "FIX LOCKED",
        satellites: 9,
        latitude: "18.5204° N",
        longitude: "73.8567° E",
        elevation: "560 m",
        locationName: "Catchment Zone Beta — Sector 4"
      },
      threatLevel: "NORMAL",
      threatMessage: "All Node 1 multi-hazard parameters are within safe baselines.",
      threatReason: "Water level clearance nominal, gas emissions baseline, zero seismic acceleration.",

      // Hazard Classifier Scores (%)
      hazardScores: {
        fireGas: { name: "Fire / Gas Hazard", score: 6, status: "Normal", color: "#10B981", desc: "MQ-2 + BME280 thermal cross-correlation nominal." },
        flood: { name: "Flood Risk", score: 12, status: "Normal", color: "#3B82F6", desc: "Ultrasonic clearance 142.5cm, water level steady." },
        earthquake: { name: "Earthquake / Vibration", score: 2, status: "Normal", color: "#8B5CF6", desc: "MPU6050 static 1.00G resting gravity vector." }
      },

      sensors: {
        water_level: {
          code: "HC-SR04",
          name: "Ultrasonic Water Level / Clearance",
          value: 142.5,
          unit: "cm",
          status: "NORMAL",
          statusText: "Safe Margin",
          baseline: "120 – 200 cm",
          description: "Monitors drainage / river water clearance and rate of level rise.",
          trend: [143.2, 143.0, 142.8, 142.7, 142.6, 142.5, 142.5]
        },
        mq2: {
          code: "MQ-2",
          name: "Combustible Gas / Smoke",
          value: 112,
          unit: "Raw ADC",
          status: "NORMAL",
          statusText: "Clean Air",
          baseline: "80 – 160",
          description: "Detects smoke, LPG, methane, and flammable hydrocarbons.",
          trend: [108, 110, 111, 114, 112, 113, 112]
        },
        bme_temp: {
          code: "BME280-T",
          name: "Ambient Temperature",
          value: 28.40,
          unit: "°C",
          status: "NORMAL",
          statusText: "Nominal",
          baseline: "22.0 – 35.0 °C",
          description: "Calibrated environmental temperature.",
          trend: [28.1, 28.2, 28.3, 28.35, 28.4, 28.4, 28.4]
        },
        bme_humidity: {
          code: "BME280-H",
          name: "Relative Humidity",
          value: 64.8,
          unit: "% RH",
          status: "NORMAL",
          statusText: "Optimal",
          baseline: "40 – 80 %",
          description: "Atmospheric moisture level for flood & heat calculation.",
          trend: [66.0, 65.5, 65.2, 65.0, 64.9, 64.8, 64.8]
        },
        bme_press: {
          code: "BME280-P",
          name: "Barometric Pressure",
          value: 1008.20,
          unit: "hPa",
          status: "NORMAL",
          statusText: "Stable",
          baseline: "995 – 1025 hPa",
          description: "High-precision surface barometric pressure.",
          trend: [1008.0, 1008.1, 1008.15, 1008.2, 1008.2, 1008.2, 1008.2]
        },
        mpu_accel: {
          code: "MPU6050-A",
          name: "3-Axis Acceleration (Earthquake Vector)",
          value: { x: -0.02, y: 0.04, z: 9.81 },
          unit: "m/s²",
          status: "NORMAL",
          statusText: "Stationary",
          baseline: "Z ≈ 9.81 m/s² (1.00 G)",
          description: "Measures sudden seismic shocks, building sway, and tremors.",
          trend: [9.81, 9.80, 9.81, 9.81, 9.82, 9.81, 9.81]
        },
        mpu_vibe: {
          code: "MPU6050-V",
          name: "Dynamic Vibration Severity",
          value: 0.08,
          unit: "m/s²",
          status: "NORMAL",
          statusText: "Quiet",
          baseline: "< 0.50 m/s²",
          description: "Calculated RMS dynamic vibration magnitude.",
          trend: [0.06, 0.07, 0.08, 0.07, 0.09, 0.08, 0.08]
        },
        gps: {
          code: "NEO-6M",
          name: "GPS Geolocation",
          value: "18.5204° N, 73.8567° E",
          unit: "3D Fix Locked",
          status: "NORMAL",
          statusText: "9 Sats",
          baseline: "Fix Locked",
          description: "DGPS differential positioning locked to geographic coordinates."
        }
      },

      // 10-Minute Frozen Static Telemetry Snapshot (Used for Model Retraining & CSV Logging)
      staticSnapshot: {
        capturedTime: "10:40:00 AM",
        readings: {
          water_level: { code: "HC-SR04", name: "Ultrasonic Water Level / Clearance", value: "142.5", unit: "cm", delta: "0.0 cm", status: "NORMAL", baseline: "120 – 200 cm", weight: "35% (Flood Model)" },
          mq2: { code: "MQ-2", name: "Combustible Gas / Smoke", value: "112", unit: "Raw ADC", delta: "-1 ADC", status: "NORMAL", baseline: "80 – 160", weight: "30% (Fire/Gas)" },
          bme_temp: { code: "BME280-T", name: "Ambient Temperature", value: "28.40", unit: "°C", delta: "+0.05 °C", status: "NORMAL", baseline: "22.0 – 35.0 °C", weight: "15% (Thermal)" },
          bme_humidity: { code: "BME280-H", name: "Relative Humidity", value: "64.8", unit: "% RH", delta: "-0.1 %", status: "NORMAL", baseline: "40 – 80 %", weight: "10% (Moisture)" },
          bme_press: { code: "BME280-P", name: "Barometric Pressure", value: "1008.20", unit: "hPa", delta: "+0.02 hPa", status: "NORMAL", baseline: "995 – 1025 hPa", weight: "5% (Weather)" },
          mpu_accel: { code: "MPU6050-A", name: "3-Axis Acceleration Vector", value: "X:-0.02 Y:0.04 Z:9.81", unit: "m/s²", delta: "0.00 m/s²", status: "NORMAL", baseline: "Z ≈ 9.81 m/s²", weight: "40% (Seismic)" },
          mpu_vibe: { code: "MPU6050-V", name: "Dynamic Vibration Severity", value: "0.08", unit: "m/s²", delta: "-0.01 m/s²", status: "NORMAL", baseline: "< 0.50 m/s²", weight: "25% (Seismic)" },
          gps: { code: "NEO-6M", name: "GPS Geolocation Anchor", value: "18.5204° N, 73.8567° E", unit: "Fix Locked", delta: "0.0m Shift", status: "NORMAL", baseline: "Fix Locked", weight: "Spatial Anchor" }
        }
      },

      trend1Hour: {
        timestamps: ["09:50", "10:00", "10:10", "10:20", "10:30", "10:40", "10:50"],
        waterLevel: [143.2, 143.0, 142.8, 142.7, 142.6, 142.5, 142.5],
        mq2: [108, 110, 111, 114, 112, 113, 112],
        temp: [28.1, 28.2, 28.3, 28.35, 28.4, 28.4, 28.4],
        humidity: [66.0, 65.5, 65.2, 65.0, 64.9, 64.8, 64.8],
        vibration: [0.06, 0.07, 0.08, 0.07, 0.09, 0.08, 0.08]
      },

      records: [
        { id: "REC-OP-301", timestamp: "2026-09-04 10:50:00", water_level: "142.5 cm", mq2: 112, temp: "28.40 °C", humidity: "64.8%", press: "1008.20 hPa", vibration: "0.08 m/s²", status: "NORMAL" },
        { id: "REC-OP-300", timestamp: "2026-09-04 10:40:00", water_level: "142.5 cm", mq2: 113, temp: "28.40 °C", humidity: "64.9%", press: "1008.20 hPa", vibration: "0.08 m/s²", status: "NORMAL" },
        { id: "REC-OP-299", timestamp: "2026-09-04 10:30:00", water_level: "142.6 cm", mq2: 112, temp: "28.35 °C", humidity: "65.0%", press: "1008.18 hPa", vibration: "0.09 m/s²", status: "NORMAL" },
        { id: "REC-OP-298", timestamp: "2026-09-04 10:20:00", water_level: "142.7 cm", mq2: 114, temp: "28.30 °C", humidity: "65.2%", press: "1008.15 hPa", vibration: "0.07 m/s²", status: "NORMAL" },
        { id: "REC-OP-297", timestamp: "2026-09-04 10:10:00", water_level: "142.8 cm", mq2: 111, temp: "28.25 °C", humidity: "65.5%", press: "1008.12 hPa", vibration: "0.08 m/s²", status: "NORMAL" },
        { id: "REC-OP-296", timestamp: "2026-09-04 10:00:00", water_level: "143.0 cm", mq2: 110, temp: "28.20 °C", humidity: "65.8%", press: "1008.10 hPa", vibration: "0.07 m/s²", status: "NORMAL" },
        { id: "REC-OP-295", timestamp: "2026-09-04 09:50:00", water_level: "143.2 cm", mq2: 108, temp: "28.10 °C", humidity: "66.0%", press: "1008.00 hPa", vibration: "0.06 m/s²", status: "NORMAL" }
      ]
    },

    // =========================================================================
    // DUMMY NODE: EIN-03 (Dummy Node)
    // =========================================================================
    "EIN-03": {
      id: "EIN-03",
      name: "Dummy Node (EIN-03)",
      tag: "DUMMY NODE",
      status: "OFFLINE",
      type: "Dummy Node Station",
      firmware: "v3.0.0-EIN",
      interval: "10 Minutes",
      battery: 95,
      batteryType: "Hybrid Solar / Supercapacitor Buffer",
      signalDbm: -52,
      signalQuality: "High Throughput (LoRaWAN + Sat-IoT)",
      gps: {
        status: "FIX LOCKED",
        satellites: 11,
        latitude: "19.0760° N",
        longitude: "72.8777° E",
        elevation: "18 m",
        locationName: "Coastal & Industrial Vulnerability Corridor"
      },
      threatLevel: "NORMAL",
      threatMessage: "Dummy Node AI risk matrix indicates nominal conditions across all vectors.",
      threatReason: "Zero compound flood/landslide risk, ambient particulate AQI 32, zero industrial toxic plume.",

      // Six-Hazard ML Outputs (from PDF)
      hazardScores: {
        flood: { name: "1. Flood / Flash Flood", score: 8, status: "Low Risk", color: "#3B82F6", desc: "Rainfall: 0mm/h, Water clearance: 85cm, Soil moisture: 28.4%." },
        fire: { name: "2. Forest Fire", score: 11, status: "Low Risk", color: "#EF4444", desc: "Temp: 29.2°C, Humidity: 68.5%, VOC: 42ppb, Wind: 3.2m/s." },
        pollution: { name: "3. Air Pollution", score: 16, status: "Good (AQI 32)", color: "#10B981", desc: "PM2.5: 24.5µg/m³, PM10: 48.2µg/m³, NO2: 18ppb, SO2: 6ppb." },
        heat: { name: "4. Extreme Heat", score: 14, status: "Comfortable", color: "#F59E0B", desc: "Temp: 29.2°C, Radiation: 580 W/m², Thermal index normal." },
        landslide: { name: "5. Landslide", score: 3, status: "Stable Slope", color: "#8B5CF6", desc: "Soil: 28.4%, Inclinometer tilt: 0.12°, Displacement: 0.0mm." },
        chemical: { name: "6. Industrial Gas Leak", score: 2, status: "Clean", color: "#06B6D4", desc: "VOC, CO, NO2 & SO2 levels strictly at environmental baseline." }
      },

      sensors: {
        temp: { code: "TEMP", name: "Ambient Temperature", value: 29.2, unit: "°C", status: "NORMAL", baseline: "20 – 38 °C", trend: [28.8, 28.9, 29.0, 29.1, 29.2, 29.2, 29.2] },
        humidity: { code: "HUM", name: "Relative Humidity", value: 68.5, unit: "% RH", status: "NORMAL", baseline: "30 – 85 %", trend: [70.1, 69.8, 69.2, 68.9, 68.6, 68.5, 68.5] },
        rain: { code: "RAIN", name: "Rain Gauge Intensity", value: 0.0, unit: "mm/h", status: "NORMAL", baseline: "< 15 mm/h", trend: [0, 0, 0, 0, 0, 0, 0] },
        water_level: { code: "W-LVL", name: "Hydrological Water Level", value: 85.0, unit: "cm", status: "NORMAL", baseline: "60 – 150 cm", trend: [85.2, 85.1, 85.0, 85.0, 85.0, 85.0, 85.0] },
        water_flow: { code: "FLOW", name: "Water Flow Discharge Speed", value: 0.42, unit: "m/s", status: "NORMAL", baseline: "< 2.5 m/s", trend: [0.44, 0.43, 0.42, 0.42, 0.42, 0.42, 0.42] },
        pm25: { code: "PM2.5", name: "Fine Particulate PM2.5", value: 24.5, unit: "µg/m³", status: "NORMAL", baseline: "< 60 µg/m³", trend: [26.0, 25.4, 25.1, 24.8, 24.6, 24.5, 24.5] },
        pm10: { code: "PM10", name: "Coarse Particulate PM10", value: 48.2, unit: "µg/m³", status: "NORMAL", baseline: "< 100 µg/m³", trend: [51.0, 50.2, 49.5, 48.9, 48.4, 48.2, 48.2] },
        co: { code: "CO", name: "Carbon Monoxide", value: 1.20, unit: "ppm", status: "NORMAL", baseline: "< 9.0 ppm", trend: [1.18, 1.19, 1.20, 1.20, 1.21, 1.20, 1.20] },
        co2: { code: "CO2", name: "Carbon Dioxide", value: 415, unit: "ppm", status: "NORMAL", baseline: "< 1000 ppm", trend: [412, 414, 415, 415, 416, 415, 415] },
        voc: { code: "VOC", name: "Volatile Organic Compounds", value: 42, unit: "ppb", status: "NORMAL", baseline: "< 220 ppb", trend: [39, 40, 41, 42, 42, 42, 42] },
        no2: { code: "NO2", name: "Nitrogen Dioxide", value: 18.0, unit: "ppb", status: "NORMAL", baseline: "< 80 ppb", trend: [17.5, 17.8, 18.0, 18.0, 18.1, 18.0, 18.0] },
        so2: { code: "SO2", name: "Sulfur Dioxide", value: 6.2, unit: "ppb", status: "NORMAL", baseline: "< 40 ppb", trend: [6.0, 6.1, 6.2, 6.2, 6.2, 6.2, 6.2] },
        soil: { code: "SOIL", name: "Soil Moisture VWC", value: 28.4, unit: "%", status: "NORMAL", baseline: "< 65 %", trend: [28.6, 28.5, 28.4, 28.4, 28.4, 28.4, 28.4] },
        tilt: { code: "TILT", name: "Inclinometer Slope Tilt", value: 0.12, unit: "°", status: "NORMAL", baseline: "< 2.0 °", trend: [0.12, 0.12, 0.12, 0.12, 0.12, 0.12, 0.12] },
        displacement: { code: "DISP", name: "Ground Displacement GNSS", value: 0.0, unit: "mm", status: "NORMAL", baseline: "< 5.0 mm", trend: [0, 0, 0, 0, 0, 0, 0] },
        wind_speed: { code: "WIND-S", name: "Wind Velocity", value: 3.2, unit: "m/s", status: "NORMAL", baseline: "< 18 m/s", trend: [2.9, 3.1, 3.0, 3.2, 3.3, 3.2, 3.2] },
        wind_dir: { code: "WIND-D", name: "Wind Direction Azimuth", value: 245, unit: "° WSW", status: "NORMAL", baseline: "0 – 360°", trend: [240, 242, 245, 245, 246, 245, 245] },
        solar: { code: "SOLAR", name: "Solar Radiation Intensity", value: 580, unit: "W/m²", status: "NORMAL", baseline: "< 1100 W/m²", trend: [560, 570, 575, 580, 582, 580, 580] }
      },

      // 10-Minute Frozen Static Telemetry Snapshot (Used for Model Retraining & CSV Logging)
      staticSnapshot: {
        capturedTime: "10:40:00 AM",
        readings: {
          temp: { code: "TEMP", name: "Ambient Temperature", value: "29.2", unit: "°C", delta: "+0.1 °C", status: "NORMAL", baseline: "20 – 38 °C", weight: "Heat/Fire" },
          humidity: { code: "HUM", name: "Relative Humidity", value: "68.5", unit: "% RH", delta: "-0.1 %", status: "NORMAL", baseline: "30 – 85 %", weight: "Fire/Flood" },
          rain: { code: "RAIN", name: "Rain Gauge Intensity", value: "0.0", unit: "mm/h", delta: "0.0 mm/h", status: "NORMAL", baseline: "< 15 mm/h", weight: "Flood (40%)" },
          water_level: { code: "W-LVL", name: "Hydrological Water Level", value: "85.0", unit: "cm", delta: "0.0 cm", status: "NORMAL", baseline: "60 – 150 cm", weight: "Flood (35%)" },
          water_flow: { code: "FLOW", name: "Water Flow Discharge Speed", value: "0.42", unit: "m/s", delta: "0.00 m/s", status: "NORMAL", baseline: "< 2.5 m/s", weight: "Flood (25%)" },
          pm25: { code: "PM2.5", name: "Fine Particulate PM2.5", value: "24.5", unit: "µg/m³", delta: "-0.1 µg/m³", status: "NORMAL", baseline: "< 60 µg/m³", weight: "AQI (50%)" },
          pm10: { code: "PM10", name: "Coarse Particulate PM10", value: "48.2", unit: "µg/m³", delta: "-0.2 µg/m³", status: "NORMAL", baseline: "< 100 µg/m³", weight: "AQI (30%)" },
          co: { code: "CO", name: "Carbon Monoxide", value: "1.20", unit: "ppm", delta: "0.00 ppm", status: "NORMAL", baseline: "< 9.0 ppm", weight: "Toxic Plume" },
          co2: { code: "CO2", name: "Carbon Dioxide", value: "415", unit: "ppm", delta: "-1 ppm", status: "NORMAL", baseline: "< 1000 ppm", weight: "AQI (10%)" },
          voc: { code: "VOC", name: "Volatile Organic Compounds", value: "42", unit: "ppb", delta: "0 ppb", status: "NORMAL", baseline: "< 220 ppb", weight: "Chemical Leak" },
          no2: { code: "NO2", name: "Nitrogen Dioxide", value: "18.0", unit: "ppb", delta: "-0.1 ppb", status: "NORMAL", baseline: "< 80 ppb", weight: "Chemical Leak" },
          so2: { code: "SO2", name: "Sulfur Dioxide", value: "6.2", unit: "ppb", delta: "0.0 ppb", status: "NORMAL", baseline: "< 40 ppb", weight: "Chemical Leak" },
          soil: { code: "SOIL", name: "Soil Moisture VWC", value: "28.4", unit: "%", delta: "0.0 %", status: "NORMAL", baseline: "< 65 %", weight: "Landslide (35%)" },
          tilt: { code: "TILT", name: "Inclinometer Slope Tilt", value: "0.12", unit: "°", delta: "0.00 °", status: "NORMAL", baseline: "< 2.0 °", weight: "Landslide (45%)" },
          displacement: { code: "DISP", name: "Ground Displacement GNSS", value: "0.0", unit: "mm", delta: "0.0 mm", status: "NORMAL", baseline: "< 5.0 mm", weight: "Landslide (20%)" },
          wind_speed: { code: "WIND-S", name: "Wind Velocity", value: "3.2", unit: "m/s", delta: "-0.1 m/s", status: "NORMAL", baseline: "< 18 m/s", weight: "Fire Propagation" },
          wind_dir: { code: "WIND-D", name: "Wind Direction Azimuth", value: "245", unit: "° WSW", delta: "0°", status: "NORMAL", baseline: "0 – 360°", weight: "Plume Vector" },
          solar: { code: "SOLAR", name: "Solar Radiation Intensity", value: "580", unit: "W/m²", delta: "-2 W/m²", status: "NORMAL", baseline: "< 1100 W/m²", weight: "Thermal Index" }
        }
      },

      trend1Hour: {
        timestamps: ["09:50", "10:00", "10:10", "10:20", "10:30", "10:40", "10:50"],
        pm25: [26.0, 25.4, 25.1, 24.8, 24.6, 24.5, 24.5],
        waterLevel: [85.2, 85.1, 85.0, 85.0, 85.0, 85.0, 85.0],
        temp: [28.8, 28.9, 29.0, 29.1, 29.2, 29.2, 29.2],
        soil: [28.6, 28.5, 28.4, 28.4, 28.4, 28.4, 28.4],
        radiation: [560, 570, 575, 580, 582, 580, 580]
      },

      records: [
        { id: "REC-EIN-880", timestamp: "2026-09-04 10:50:00", pm25: "24.5 µg/m³", water_level: "85.0 cm", temp: "29.2 °C", rain: "0.0 mm/h", soil: "28.4%", wind: "3.2 m/s", status: "NORMAL" },
        { id: "REC-EIN-879", timestamp: "2026-09-04 10:40:00", pm25: "24.5 µg/m³", water_level: "85.0 cm", temp: "29.2 °C", rain: "0.0 mm/h", soil: "28.4%", wind: "3.2 m/s", status: "NORMAL" },
        { id: "REC-EIN-878", timestamp: "2026-09-04 10:30:00", pm25: "24.6 µg/m³", water_level: "85.0 cm", temp: "29.1 °C", rain: "0.0 mm/h", soil: "28.4%", wind: "3.3 m/s", status: "NORMAL" },
        { id: "REC-EIN-877", timestamp: "2026-09-04 10:20:00", pm25: "24.8 µg/m³", water_level: "85.0 cm", temp: "29.1 °C", rain: "0.0 mm/h", soil: "28.4%", wind: "3.2 m/s", status: "NORMAL" },
        { id: "REC-EIN-876", timestamp: "2026-09-04 10:10:00", pm25: "25.1 µg/m³", water_level: "85.0 cm", temp: "29.0 °C", rain: "0.0 mm/h", soil: "28.4%", wind: "3.0 m/s", status: "NORMAL" },
        { id: "REC-EIN-875", timestamp: "2026-09-04 10:00:00", pm25: "25.4 µg/m³", water_level: "85.1 cm", temp: "28.9 °C", rain: "0.0 mm/h", soil: "28.5%", wind: "3.1 m/s", status: "NORMAL" },
        { id: "REC-EIN-874", timestamp: "2026-09-04 09:50:00", pm25: "26.0 µg/m³", water_level: "85.2 cm", temp: "28.8 °C", rain: "0.0 mm/h", soil: "28.6%", wind: "2.9 m/s", status: "NORMAL" }
      ]
    },

    // =========================================================================
    // NODE 2: AP-02 (Node 2)
    // =========================================================================
    "AP-02": {
      id: "AP-02",
      name: "Node 2 (AP-02)",
      tag: "NODE 2",
      status: "OFFLINE",
      type: "Node 2 Environmental Station",
      firmware: "v1.0.0",
      interval: "10 Minutes",
      battery: 92,
      batteryType: "Simulated Lithium Cell",
      signalDbm: -63,
      signalQuality: "LoRa 868MHz Uplink",
      gps: {
        status: "NO FIX",
        satellites: 0,
        latitude: "--",
        longitude: "--",
        elevation: "--",
        locationName: "Indoor Testing Bench (Searching Satellites)"
      },
      threatLevel: "NORMAL",
      threatMessage: "All parameters are currently within the normal range.",
      threatReason: "Baseline gas levels and environmental parameters stable.",

      hazardScores: {
        gasAnomaly: { name: "Gas Anomaly Score", score: 4, status: "Normal", color: "#10B981", desc: "MQ-2/5/135 clean baseline." },
        thermalShock: { name: "Thermal / Pressure Delta", score: 2, status: "Normal", color: "#3B82F6", desc: "BMP280 nominal thermal gradient." },
        vibrationTamper: { name: "Vibration / Tamper", score: 0, status: "Normal", color: "#8B5CF6", desc: "SW-420 resting low state." }
      },

      sensors: {
        mq2: { code: "MQ-2", name: "Smoke / Combustible Gas", value: 97, unit: "Raw ADC", status: "NORMAL", baseline: "70 – 130", trend: [92, 94, 95, 96, 98, 97, 97] },
        mq5: { code: "MQ-5", name: "LPG / Natural Gas", value: 231, unit: "Raw ADC", status: "NORMAL", baseline: "180 – 260", trend: [224, 228, 230, 229, 233, 230, 231] },
        mq135: { code: "MQ-135", name: "Air Quality Gas Sensor", value: 232, unit: "Raw ADC", status: "NORMAL", baseline: "190 – 270", trend: [220, 225, 228, 234, 231, 230, 232] },
        bmp_temp: { code: "BMP280-T", name: "Ambient Temperature", value: 26.68, unit: "°C", status: "NORMAL", baseline: "20.0 – 32.0 °C", trend: [26.4, 26.51, 26.58, 26.62, 26.65, 26.68, 26.68] },
        bmp_press: { code: "BMP280-P", name: "Atmospheric Pressure", value: 1001.47, unit: "hPa", status: "NORMAL", baseline: "990 – 1020 hPa", trend: [1001.2, 1001.35, 1001.4, 1001.42, 1001.45, 1001.47, 1001.47] },
        mpu_accel: { code: "MPU6050-A", name: "3-Axis Acceleration", value: { x: -0.90, y: -0.18, z: 9.92 }, unit: "m/s²", status: "NORMAL", baseline: "Z ≈ 9.81 m/s²", trend: [9.9, 9.91, 9.92, 9.92, 9.91, 9.92, 9.92] },
        mpu_gyro: { code: "MPU6050-G", name: "3-Axis Gyroscope", value: { x: 2.37, y: 2.54, z: 3.33 }, unit: "°/s", status: "NORMAL", baseline: "< 5.0 °/s", trend: [2.8, 3.1, 2.9, 2.7, 3.0, 3.2, 3.33] },
        vibration: { code: "SW-420", name: "Vibration Sensor", value: 0, unit: "Raw Value", status: "NORMAL", baseline: "0 (Low)", trend: [0, 0, 0, 0, 0, 0, 0] },
        gps: { code: "NEO-6M", name: "GPS Geolocation", value: "NO FIX", unit: "Searching...", status: "WARNING", baseline: "Fix Locked" }
      },

      // 10-Minute Frozen Static Telemetry Snapshot (Used for Model Retraining & CSV Logging)
      staticSnapshot: {
        capturedTime: "10:40:00 AM",
        readings: {
          mq2: { code: "MQ-2", name: "Smoke / Combustible Gas", value: "97", unit: "Raw ADC", delta: "-1 ADC", status: "NORMAL", baseline: "70 – 130", weight: "Gas Anomaly" },
          mq5: { code: "MQ-5", name: "LPG / Natural Gas", value: "231", unit: "Raw ADC", delta: "+1 ADC", status: "NORMAL", baseline: "180 – 260", weight: "Gas Anomaly" },
          mq135: { code: "MQ-135", name: "Air Quality Gas Sensor", value: "232", unit: "Raw ADC", delta: "+2 ADC", status: "NORMAL", baseline: "190 – 270", weight: "Air Quality" },
          bmp_temp: { code: "BMP280-T", name: "Ambient Temperature", value: "26.68", unit: "°C", delta: "+0.01 °C", status: "NORMAL", baseline: "20.0 – 32.0 °C", weight: "Thermal Shock" },
          bmp_press: { code: "BMP280-P", name: "Atmospheric Pressure", value: "1001.47", unit: "hPa", delta: "+0.01 hPa", status: "NORMAL", baseline: "990 – 1020 hPa", weight: "Pressure Gradient" },
          mpu_accel: { code: "MPU6050-A", name: "3-Axis Acceleration Vector", value: "X:-0.90 Y:-0.18 Z:9.92", unit: "m/s²", delta: "0.00 m/s²", status: "NORMAL", baseline: "Z ≈ 9.81 m/s²", weight: "Seismic Shock" },
          mpu_gyro: { code: "MPU6050-G", name: "3-Axis Gyroscope Rate", value: "X:2.37 Y:2.54 Z:3.33", unit: "°/s", delta: "+0.13 °/s", status: "NORMAL", baseline: "< 5.0 °/s", weight: "Orientation" },
          vibration: { code: "SW-420", name: "Vibration Tamper Sensor", value: "0", unit: "Raw Value", delta: "0", status: "NORMAL", baseline: "0 (Low)", weight: "Tamper Detection" },
          gps: { code: "NEO-6M", name: "GPS Geolocation Anchor", value: "NO FIX", unit: "Searching...", delta: "Searching", status: "WARNING", baseline: "Fix Locked", weight: "Spatial Tag" }
        }
      },

      trend1Hour: {
        timestamps: ["09:50", "10:00", "10:10", "10:20", "10:30", "10:40", "10:50"],
        mq2: [91, 94, 95, 96, 98, 97, 97],
        mq5: [224, 228, 230, 229, 233, 230, 231],
        mq135: [220, 225, 228, 234, 231, 230, 232],
        temp: [26.4, 26.48, 26.55, 26.6, 26.64, 26.67, 26.68]
      },

      records: [
        { id: "REC-AP-1049", timestamp: "2026-09-04 10:50:00", mq2: 97, mq5: 231, mq135: 232, temp: "26.68 °C", press: "1001.47 hPa", vibration: 0, status: "NORMAL" },
        { id: "REC-AP-1048", timestamp: "2026-09-04 10:40:00", mq2: 97, mq5: 230, mq135: 230, temp: "26.67 °C", press: "1001.46 hPa", vibration: 0, status: "NORMAL" },
        { id: "REC-AP-1047", timestamp: "2026-09-04 10:30:00", mq2: 98, mq5: 233, mq135: 231, temp: "26.64 °C", press: "1001.44 hPa", vibration: 0, status: "NORMAL" },
        { id: "REC-AP-1046", timestamp: "2026-09-04 10:20:00", mq2: 96, mq5: 229, mq135: 234, temp: "26.60 °C", press: "1001.40 hPa", vibration: 0, status: "NORMAL" }
      ]
    }
  },

  /**
   * Helper: Get current active node object
   */
  getActiveNode() {
    return this.nodes[this.activeNodeId] || this.nodes["OP-01"];
  }
};
