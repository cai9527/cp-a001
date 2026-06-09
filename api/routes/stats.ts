import { Router, type Response } from 'express';
import { dataStore } from '../data/store';
import { authMiddleware, requirePermission, type AuthenticatedRequest } from '../middleware/auth.js';
import { PERMISSIONS } from '../../shared/types';
import type { ApiResponse, OverviewStats, AreaStats } from '../../shared/types';

const router = Router();

router.use(authMiddleware);

router.get('/overview', requirePermission(PERMISSIONS.VIEW_DASHBOARD), (_req: AuthenticatedRequest, res: Response) => {
  const devices = dataStore.getDevices();
  const monitoringData = dataStore.getMonitoringData();

  const totalDevices = devices.length;
  const onlineDevices = devices.filter((d) => d.status === 'online').length;
  const offlineDevices = devices.filter((d) => d.status === 'offline').length;
  const warningDevices = devices.filter((d) => d.status === 'warning').length;

  const avgPm25 = monitoringData.length
    ? Number((monitoringData.reduce((sum, d) => sum + d.pm25, 0) / monitoringData.length).toFixed(1))
    : 0;
  const avgPm10 = monitoringData.length
    ? Number((monitoringData.reduce((sum, d) => sum + d.pm10, 0) / monitoringData.length).toFixed(1))
    : 0;
  const avgNoise = monitoringData.length
    ? Number((monitoringData.reduce((sum, d) => sum + d.noise, 0) / monitoringData.length).toFixed(1))
    : 0;

  const normalCount = monitoringData.filter((d) => d.status === 'normal').length;
  const warningCount = monitoringData.filter((d) => d.status === 'warning').length;
  const dangerCount = monitoringData.filter((d) => d.status === 'danger').length;

  const overview: OverviewStats = {
    totalDevices,
    onlineDevices,
    offlineDevices,
    warningDevices,
    avgPm25,
    avgPm10,
    avgNoise,
    dangerCount,
    warningCount,
    normalCount,
  };

  const response: ApiResponse<OverviewStats> = {
    code: 0,
    message: 'success',
    data: overview,
  };
  res.json(response);
});

router.get('/area', requirePermission(PERMISSIONS.VIEW_DASHBOARD), (_req: AuthenticatedRequest, res: Response) => {
  const devices = dataStore.getDevices();
  const monitoringData = dataStore.getMonitoringData();

  const areas = [...new Set(devices.map((d) => d.area))];
  const areaStats: AreaStats[] = areas.map((area) => {
    const areaDevices = devices.filter((d) => d.area === area);
    const areaData = monitoringData.filter((md) => areaDevices.some((ad) => ad.id === md.deviceId));

    return {
      area,
      deviceCount: areaDevices.length,
      avgPm25: areaData.length ? Number((areaData.reduce((s, d) => s + d.pm25, 0) / areaData.length).toFixed(1)) : 0,
      avgPm10: areaData.length ? Number((areaData.reduce((s, d) => s + d.pm10, 0) / areaData.length).toFixed(1)) : 0,
      avgNoise: areaData.length ? Number((areaData.reduce((s, d) => s + d.noise, 0) / areaData.length).toFixed(1)) : 0,
    };
  });

  const response: ApiResponse<AreaStats[]> = {
    code: 0,
    message: 'success',
    data: areaStats,
  };
  res.json(response);
});

export default router;
