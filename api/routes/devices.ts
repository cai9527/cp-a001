import { Router, type Response } from 'express';
import { dataStore } from '../data/store';
import { authMiddleware, requirePermission, type AuthenticatedRequest } from '../middleware/auth.js';
import { PERMISSIONS } from '../../shared/types';
import type { CreateDeviceRequest, UpdateDeviceRequest, ApiResponse, PaginatedResponse, Device } from '../../shared/types';

const router = Router();

router.use(authMiddleware);

router.get('/', requirePermission(PERMISSIONS.VIEW_DEVICES), (req: AuthenticatedRequest, res: Response) => {
  const { search = '', area = '', page = '1', pageSize = '10' } = req.query;
  let devices = dataStore.getDevices();

  if (search) {
    const searchStr = String(search).toLowerCase();
    devices = devices.filter(
      (d) =>
        d.name.toLowerCase().includes(searchStr) ||
        d.code.toLowerCase().includes(searchStr) ||
        d.location.toLowerCase().includes(searchStr),
    );
  }

  if (area) {
    devices = devices.filter((d) => d.area === area);
  }

  const pageNum = parseInt(String(page), 10);
  const pageSizeNum = parseInt(String(pageSize), 10);
  const total = devices.length;
  const start = (pageNum - 1) * pageSizeNum;
  const items = devices.slice(start, start + pageSizeNum);

  const response: ApiResponse<PaginatedResponse<Device>> = {
    code: 0,
    message: 'success',
    data: {
      items,
      total,
      page: pageNum,
      pageSize: pageSizeNum,
    },
  };
  res.json(response);
});

router.get('/:id', requirePermission(PERMISSIONS.VIEW_DEVICES), (req: AuthenticatedRequest, res: Response) => {
  const device = dataStore.getDeviceById(req.params.id);
  if (!device) {
    res.status(404).json({ code: 404, message: '设备不存在', data: null });
    return;
  }
  res.json({ code: 0, message: 'success', data: device });
});

router.post('/', requirePermission(PERMISSIONS.CREATE_DEVICE), (req: AuthenticatedRequest, res: Response) => {
  const data = req.body as CreateDeviceRequest;
  if (!data.name || !data.code || !data.location || !data.area) {
    res.status(400).json({ code: 400, message: '缺少必填字段', data: null });
    return;
  }
  const newDevice = dataStore.createDevice(data);
  res.status(201).json({ code: 0, message: '创建成功', data: newDevice });
});

router.put('/:id', requirePermission(PERMISSIONS.UPDATE_DEVICE), (req: AuthenticatedRequest, res: Response) => {
  const data = req.body as UpdateDeviceRequest;
  const updated = dataStore.updateDevice(req.params.id, data);
  if (!updated) {
    res.status(404).json({ code: 404, message: '设备不存在', data: null });
    return;
  }
  res.json({ code: 0, message: '更新成功', data: updated });
});

router.delete('/:id', requirePermission(PERMISSIONS.DELETE_DEVICE), (req: AuthenticatedRequest, res: Response) => {
  const deleted = dataStore.deleteDevice(req.params.id);
  if (!deleted) {
    res.status(404).json({ code: 404, message: '设备不存在', data: null });
    return;
  }
  res.json({ code: 0, message: '删除成功', data: null });
});

export default router;
