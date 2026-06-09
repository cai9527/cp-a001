import { Router, type Response } from 'express';
import { dataStore } from '../data/store';
import { authMiddleware, requirePermission, type AuthenticatedRequest } from '../middleware/auth.js';
import { PERMISSIONS } from '../../shared/types';
import type { ApiResponse, MonitoringData } from '../../shared/types';

const router = Router();

router.use(authMiddleware);

router.get('/realtime', requirePermission(PERMISSIONS.VIEW_REALTIME), (_req: AuthenticatedRequest, res: Response) => {
  const data = dataStore.getMonitoringData();
  const response: ApiResponse<MonitoringData[]> = {
    code: 0,
    message: 'success',
    data,
  };
  res.json(response);
});

router.get('/realtime/:deviceId', requirePermission(PERMISSIONS.VIEW_REALTIME), (req: AuthenticatedRequest, res: Response) => {
  const data = dataStore.getMonitoringDataByDeviceId(req.params.deviceId);
  if (!data) {
    res.status(404).json({ code: 404, message: '未找到该设备数据', data: null });
    return;
  }
  res.json({ code: 0, message: 'success', data });
});

export default router;
