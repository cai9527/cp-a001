import type { Device, MonitoringData, CreateDeviceRequest, UpdateDeviceRequest } from '../../shared/types';
import { initialDevices, generateMonitoringData } from './mockData';

class DataStore {
  private devices: Device[] = [...initialDevices];
  private monitoringData: MonitoringData[] = [];

  constructor() {
    this.monitoringData = generateMonitoringData(this.devices);
    setInterval(() => {
      this.monitoringData = generateMonitoringData(this.devices);
    }, 5000);
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
}

export const dataStore = new DataStore();
