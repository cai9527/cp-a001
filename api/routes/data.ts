import { Router, type Request, type Response } from 'express';
import { dataStore } from '../data/store';
import type { ApiResponse, MonitoringData } from '../../shared/types';

const router = Router();

router.get('/realtime', (_req: Request, res: Response) => {
  const data = dataStore.getMonitoringData();
  const response: ApiResponse<MonitoringData[]> = {
    code: 0,
    message: 'success',
    data,
  };
  res.json(response);
});

router.get('/realtime/:deviceId', (req: Request, res: Response) => {
  const data = dataStore.getMonitoringDataByDeviceId(req.params.deviceId);
  if (!data) {
    res.status(404).json({ code: 404, message: '未找到该设备数据', data: null });
    return;
  }
  res.json({ code: 0, message: 'success', data });
});

export default router;
