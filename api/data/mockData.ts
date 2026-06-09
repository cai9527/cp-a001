import type { Device, MonitoringData, TimeSeriesPoint, DeviceTimeSeries, AreaTimeSeries, TimeRange, MetricType, DataStatus, DeviceHeatmapData } from '../../shared/types';

export const initialDevices: Device[] = [
  {
    id: 'dev-001',
    name: '东区一号监测站',
    code: 'YC-EAST-001',
    location: '东区建设路与民生路交叉口',
    area: '东区',
    status: 'online',
    pm25Threshold: 75,
    pm10Threshold: 150,
    noiseThreshold: 70,
    ipAddress: '192.168.1.101',
    port: 1883,
    protocol: 'MQTT',
    createdAt: '2025-01-15T08:30:00Z',
    updatedAt: '2025-01-15T08:30:00Z',
  },
  {
    id: 'dev-002',
    name: '东区二号监测站',
    code: 'YC-EAST-002',
    location: '东区工业园区A栋楼顶',
    area: '东区',
    status: 'online',
    pm25Threshold: 75,
    pm10Threshold: 150,
    noiseThreshold: 70,
    ipAddress: '192.168.1.102',
    port: 1883,
    protocol: 'MQTT',
    createdAt: '2025-01-16T09:00:00Z',
    updatedAt: '2025-01-16T09:00:00Z',
  },
  {
    id: 'dev-003',
    name: '西区一号监测站',
    code: 'YC-WEST-001',
    location: '西区政府广场东侧',
    area: '西区',
    status: 'warning',
    pm25Threshold: 75,
    pm10Threshold: 150,
    noiseThreshold: 65,
    ipAddress: '192.168.2.101',
    port: 8080,
    protocol: 'HTTP',
    createdAt: '2025-01-10T14:20:00Z',
    updatedAt: '2025-01-20T11:00:00Z',
  },
  {
    id: 'dev-004',
    name: '西区二号监测站',
    code: 'YC-WEST-002',
    location: '西区建筑工地入口',
    area: '西区',
    status: 'online',
    pm25Threshold: 70,
    pm10Threshold: 140,
    noiseThreshold: 75,
    ipAddress: '192.168.2.102',
    port: 502,
    protocol: 'Modbus',
    createdAt: '2025-02-01T10:15:00Z',
    updatedAt: '2025-02-01T10:15:00Z',
  },
  {
    id: 'dev-005',
    name: '南区一号监测站',
    code: 'YC-SOUTH-001',
    location: '南区物流园区中心',
    area: '南区',
    status: 'online',
    pm25Threshold: 80,
    pm10Threshold: 160,
    noiseThreshold: 70,
    ipAddress: '192.168.3.101',
    port: 1883,
    protocol: 'MQTT',
    createdAt: '2025-01-20T16:45:00Z',
    updatedAt: '2025-01-20T16:45:00Z',
  },
  {
    id: 'dev-006',
    name: '南区二号监测站',
    code: 'YC-SOUTH-002',
    location: '南区居民小区旁',
    area: '南区',
    status: 'offline',
    pm25Threshold: 65,
    pm10Threshold: 130,
    noiseThreshold: 60,
    ipAddress: '192.168.3.102',
    port: 1883,
    protocol: 'MQTT',
    createdAt: '2025-02-10T08:00:00Z',
    updatedAt: '2025-02-10T08:00:00Z',
  },
];

function getRandomValue(min: number, max: number, decimals: number = 0): number {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

export function generateMonitoringData(devices: Device[]): MonitoringData[] {
  return devices
    .filter((d) => d.status !== 'offline')
    .map((device) => {
      const pm25 = getRandomValue(15, 180);
      const pm10 = getRandomValue(30, 300);
      const noise = getRandomValue(35, 90, 1);

      const pm25Exceed = pm25 > device.pm25Threshold;
      const pm10Exceed = pm10 > device.pm10Threshold;
      const noiseExceed = noise > device.noiseThreshold;

      let status: DataStatus = 'normal';
      if (pm25 > device.pm25Threshold * 1.3 || pm10 > device.pm10Threshold * 1.3 || noise > device.noiseThreshold * 1.2) {
        status = 'danger';
      } else if (pm25Exceed || pm10Exceed || noiseExceed) {
        status = 'warning';
      }

      return {
        deviceId: device.id,
        deviceName: device.name,
        pm25,
        pm10,
        noise,
        timestamp: new Date().toISOString(),
        status,
      };
    });
}

export function getTimeRangeConfig(range: TimeRange): { points: number; intervalMs: number } {
  switch (range) {
    case '1h':
      return { points: 60, intervalMs: 60 * 1000 };
    case '6h':
      return { points: 72, intervalMs: 5 * 60 * 1000 };
    case '12h':
      return { points: 72, intervalMs: 10 * 60 * 1000 };
    case '24h':
      return { points: 96, intervalMs: 15 * 60 * 1000 };
    case '7d':
      return { points: 84, intervalMs: 2 * 60 * 60 * 1000 };
  }
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateMetricSeries(
  baseMin: number,
  baseMax: number,
  points: number,
  intervalMs: number,
  seed: number,
  decimals: number = 0,
): TimeSeriesPoint[] {
  const rand = seededRandom(seed);
  const now = Date.now();
  const result: TimeSeriesPoint[] = [];
  let lastValue = (baseMin + baseMax) / 2;

  for (let i = points - 1; i >= 0; i--) {
    const timestamp = new Date(now - i * intervalMs).toISOString();
    const change = (rand() - 0.5) * (baseMax - baseMin) * 0.15;
    let value = lastValue + change;
    value = Math.max(baseMin * 0.6, Math.min(baseMax * 1.1, value));
    value = Number(value.toFixed(decimals));
    result.push({ timestamp, value });
    lastValue = value;
  }

  return result;
}

export function generateDeviceTimeSeries(
  devices: Device[],
  timeRange: TimeRange = '24h',
): DeviceTimeSeries[] {
  const config = getTimeRangeConfig(timeRange);
  return devices
    .filter((d) => d.status !== 'offline')
    .map((device, idx) => {
      const seedBase = idx * 1000 + device.id.charCodeAt(device.id.length - 1);
      return {
        deviceId: device.id,
        deviceName: device.name,
        pm25: generateMetricSeries(20, 150, config.points, config.intervalMs, seedBase),
        pm10: generateMetricSeries(40, 250, config.points, config.intervalMs, seedBase + 1),
        noise: generateMetricSeries(40, 85, config.points, config.intervalMs, seedBase + 2, 1),
      };
    });
}

export function generateAreaTimeSeries(
  devices: Device[],
  timeRange: TimeRange = '24h',
): AreaTimeSeries[] {
  const deviceSeries = generateDeviceTimeSeries(devices, timeRange);
  const areas = [...new Set(devices.map((d) => d.area))];

  return areas.map((area) => {
    const areaDevices = devices.filter((d) => d.area === area && d.status !== 'offline');
    const areaSeries = deviceSeries.filter((s) =>
      areaDevices.some((d) => d.id === s.deviceId),
    );

    const avgSeries = (metric: 'pm25' | 'pm10' | 'noise'): TimeSeriesPoint[] => {
      if (areaSeries.length === 0) return [];
      const first = areaSeries[0][metric];
      return first.map((_, idx) => {
        const sum = areaSeries.reduce((acc, s) => acc + s[metric][idx].value, 0);
        return {
          timestamp: first[idx].timestamp,
          value: Number((sum / areaSeries.length).toFixed(1)),
        };
      });
    };

    return {
      area,
      pm25: avgSeries('pm25'),
      pm10: avgSeries('pm10'),
      noise: avgSeries('noise'),
    };
  });
}

export function generateHeatmapData(
  devices: Device[],
  timeRange: TimeRange = '24h',
  metric: MetricType = 'pm25',
): DeviceHeatmapData[] {
  const deviceSeries = generateDeviceTimeSeries(devices, timeRange);
  return deviceSeries.map((s) => {
    const series = s[metric];
    return {
      deviceName: s.deviceName,
      timestamps: series.map((p) => p.timestamp),
      values: series.map((p) => p.value),
    };
  });
}
