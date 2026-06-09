import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { Search, Plus, Edit2, Trash2, Eye, Filter } from 'lucide-react';
import Modal from '@/components/Modal';
import DeviceForm from '@/components/DeviceForm';
import { DeviceStatusBadge } from '@/components/StatusBadge';
import type { CreateDeviceRequest } from '../../shared/types';

export default function Devices() {
  const navigate = useNavigate();
  const { devices, deviceTotal, loading, fetchDevices, createDevice, deleteDevice } = useAppStore();
  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchDevices({ search, area: areaFilter });
  }, [fetchDevices, search, areaFilter]);

  const handleCreate = async (data: CreateDeviceRequest) => {
    await createDevice(data);
    setShowCreateModal(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDevice(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-dark-600">设备管理</h2>
          <p className="text-sm text-dark-400 mt-1">管理所有扬尘监测设备，共 {deviceTotal} 台</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium shadow-sm shadow-primary-500/20"
        >
          <Plus size={18} />
          新增设备
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-100 flex items-center gap-4">
          <div className="flex-1 relative max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-300" />
            <input
              type="text"
              placeholder="搜索设备名称、编号或位置..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-dark-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-dark-400" />
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="px-3 py-2 border border-dark-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
            >
              <option value="">全部区域</option>
              <option value="东区">东区</option>
              <option value="西区">西区</option>
              <option value="南区">南区</option>
              <option value="北区">北区</option>
              <option value="中区">中区</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">设备信息</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">所属区域</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">通信协议</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">阈值配置</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">创建时间</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-dark-400 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {loading && devices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-dark-400">
                    加载中...
                  </td>
                </tr>
              ) : devices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-dark-400">
                    暂无设备数据
                  </td>
                </tr>
              ) : (
                devices.map((device) => (
                  <tr key={device.id} className="hover:bg-dark-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-dark-600">{device.name}</p>
                        <p className="text-xs text-dark-400 mt-0.5">
                          {device.code} · {device.location}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-500">
                      {device.area}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <DeviceStatusBadge status={device.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-primary-50 text-primary-600 border border-primary-100 rounded">
                        {device.protocol}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-dark-400 space-y-0.5">
                        <p>PM2.5: {device.pm25Threshold} μg/m³</p>
                        <p>PM10: {device.pm10Threshold} μg/m³</p>
                        <p>噪音: {device.noiseThreshold} dB</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-400">
                      {new Date(device.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/devices/${device.id}`)}
                          className="p-2 text-dark-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                          title="查看详情"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/devices/${device.id}`)}
                          className="p-2 text-dark-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(device.id)}
                          className="p-2 text-dark-400 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={showCreateModal}
        title="新增设备"
        onClose={() => setShowCreateModal(false)}
        width="max-w-3xl"
      >
        <DeviceForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
          loading={loading}
        />
      </Modal>

      <Modal
        open={!!deleteConfirm}
        title="确认删除"
        onClose={() => setDeleteConfirm(null)}
        width="max-w-md"
      >
        <div className="py-4">
          <p className="text-dark-500">确定要删除该设备吗？删除后无法恢复。</p>
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="px-5 py-2 text-sm font-medium text-dark-500 bg-dark-50 hover:bg-dark-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="px-5 py-2 text-sm font-medium text-white bg-danger-500 hover:bg-danger-600 rounded-lg transition-colors"
            >
              确认删除
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
