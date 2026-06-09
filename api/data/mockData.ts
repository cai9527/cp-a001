import type { Device, MonitoringData } from '../../shared/types';

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

      let status: 'normal' | 'warning' | 'danger' = 'normal';
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
