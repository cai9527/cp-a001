import type { Device, MonitoringData, CreateDeviceRequest, UpdateDeviceRequest, TimeRange, MetricType, DeviceTimeSeries, AreaTimeSeries, DeviceHeatmapData, StatusDistribution, DeviceStatusDistribution } from '../../shared/types';
import { initialDevices, generateMonitoringData, generateDeviceTimeSeries, generateAreaTimeSeries, generateHeatmapData } from './mockData';

class DataStore {
  private devices: Device[] = [...initialDevices];
  private monitoringData: MonitoringData[] = [];

  constructor() {
    this.monitoringData = generateMonitoringData(this.devices);
    setInterval(() => {
      this.monitoringData = generateMonitoringData(this.devices);
    }, 3000);
  }

  getDevices(): Device[] {
    return this.devices;
  }

  getDeviceById(id: string): Device | undefined {
    return this.devices.find((d) => d.id === id);
  }

  createDevice(data: CreateDeviceRequest): Device {
    const now = new Date().toISOString();
    const newDevice: Device = {
      id: `dev-${Date.now()}`,
      ...data,
      status: 'online',
      createdAt: now,
      updatedAt: now,
    };
    this.devices.push(newDevice);
    return newDevice;
  }

  updateDevice(id: string, data: UpdateDeviceRequest): Device | undefined {
    const index = this.devices.findIndex((d) => d.id === id);
    if (index === -1) return undefined;
    this.devices[index] = {
      ...this.devices[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return this.devices[index];
  }

  deleteDevice(id: string): boolean {
    const index = this.devices.findIndex((d) => d.id === id);
    if (index === -1) return false;
    this.devices.splice(index, 1);
    return true;
  }

  getMonitoringData(): MonitoringData[] {
    return this.monitoringData;
  }

  getMonitoringDataByDeviceId(deviceId: string): MonitoringData | undefined {
    return this.monitoringData.find((d) => d.deviceId === deviceId);
  }

  getDeviceTimeSeries(deviceIds?: string[], timeRange: TimeRange = '24h'): DeviceTimeSeries[] {
    const allSeries = generateDeviceTimeSeries(this.devices, timeRange);
    if (deviceIds && deviceIds.length > 0) {
      return allSeries.filter((s) => deviceIds.includes(s.deviceId));
    }
    return allSeries;
  }

  getAreaTimeSeries(areas?: string[], timeRange: TimeRange = '24h'): AreaTimeSeries[] {
    const allSeries = generateAreaTimeSeries(this.devices, timeRange);
    if (areas && areas.length > 0) {
      return allSeries.filter((s) => areas.includes(s.area));
    }
    return allSeries;
  }

  getHeatmapData(metric: MetricType = 'pm25', timeRange: TimeRange = '24h', deviceIds?: string[]): DeviceHeatmapData[] {
    let devices = this.devices;
    if (deviceIds && deviceIds.length > 0) {
      devices = devices.filter((d) => deviceIds.includes(d.id));
    }
    return generateHeatmapData(devices, timeRange, metric);
  }

  getStatusDistribution(): StatusDistribution[] {
    const total = this.monitoringData.length || 1;
    const normal = this.monitoringData.filter((d) => d.status === 'normal').length;
    const warning = this.monitoringData.filter((d) => d.status === 'warning').length;
    const danger = this.monitoringData.filter((d) => d.status === 'danger').length;
    return [
      { status: 'normal', count: normal, percentage: Number(((normal / total) * 100).toFixed(1)) },
      { status: 'warning', count: warning, percentage: Number(((warning / total) * 100).toFixed(1)) },
      { status: 'danger', count: danger, percentage: Number(((danger / total) * 100).toFixed(1)) },
    ];
  }

  getDeviceStatusDistribution(): DeviceStatusDistribution[] {
    const total = this.devices.length || 1;
    const online = this.devices.filter((d) => d.status === 'online').length;
    const offline = this.devices.filter((d) => d.status === 'offline').length;
    const warning = this.devices.filter((d) => d.status === 'warning').length;
    return [
      { status: 'online', count: online, percentage: Number(((online / total) * 100).toFixed(1)) },
      { status: 'warning', count: warning, percentage: Number(((warning / total) * 100).toFixed(1)) },
      { status: 'offline', count: offline, percentage: Number(((offline / total) * 100).toFixed(1)) },
    ];
  }
}

export const dataStore = new DataStore();
