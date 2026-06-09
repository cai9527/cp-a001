import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import type { Device, CreateDeviceRequest } from '../../shared/types';
import { ArrowLeft, Edit2, MapPin, Cpu, Wifi, Clock, Settings, Network } from 'lucide-react';
import { DeviceStatusBadge, DataStatusBadge } from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import DeviceForm from '@/components/DeviceForm';
import { cn } from '@/lib/utils';

export default function DeviceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchDeviceById, updateDevice, fetchMonitoringData, monitoringData, loading } = useAppStore();
  const [device, setDevice] = useState<Device | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDeviceById(id).then((d) => d && setDevice(d));
      fetchMonitoringData();
    }
  }, [id, fetchDeviceById, fetchMonitoringData]);

  const deviceData = monitoringData.find((d) => d.deviceId === id);

  const handleUpdate = async (data: CreateDeviceRequest) => {
    if (id) {
      await updateDevice(id, data);
      const updated = await fetchDeviceById(id);
      if (updated) setDevice(updated);
      setShowEditModal(false);
    }
  };

  if (!device) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-dark-400">加载中...</p>
      </div>
    );
  }

  const InfoItem = ({ icon: Icon, label, value, color = 'text-dark-500' }: { icon: React.ComponentType<any>; label: string; value: string; color?: string }) => (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-dark-50 flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-dark-400" />
      </div>
      <div>
        <p className="text-xs text-dark-400 mb-0.5">{label}</p>
        <p className={cn('text-sm font-medium', color)}>{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/devices')}
          className="p-2 text-dark-400 hover:text-dark-600 hover:bg-white rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-dark-600">{device.name}</h2>
            <DeviceStatusBadge status={device.status} />
          </div>
          <p className="text-sm text-dark-400 mt-1">设备编号：{device.code}</p>
        </div>
        <button
          onClick={() => setShowEditModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
        >
          <Edit2 size={16} />
          编辑设备
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {deviceData && (
            <div className="bg-white rounded-xl shadow-card p-6">
              <h3 className="text-base font-semibold text-dark-600 mb-4">实时监测数据</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 text-center">
                  <p className="text-sm text-dark-400 mb-1">PM2.5</p>
                  <p className="text-3xl font-bold text-dark-600">{deviceData.pm25}</p>
                  <p className="text-xs text-dark-400 mt-1">μg/m³</p>
                  <p className="text-xs mt-2">阈值: {device.pm25Threshold} μg/m³</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 text-center">
                  <p className="text-sm text-dark-400 mb-1">PM10</p>
                  <p className="text-3xl font-bold text-dark-600">{deviceData.pm10}</p>
                  <p className="text-xs text-dark-400 mt-1">μg/m³</p>
                  <p className="text-xs mt-2">阈值: {device.pm10Threshold} μg/m³</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 text-center">
                  <p className="text-sm text-dark-400 mb-1">噪音</p>
                  <p className="text-3xl font-bold text-dark-600">{deviceData.noise}</p>
                  <p className="text-xs text-dark-400 mt-1">dB</p>
                  <p className="text-xs mt-2">阈值: {device.noiseThreshold} dB</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-dark-400">数据状态：</span>
                  <DataStatusBadge status={deviceData.status} />
                </div>
                <p className="text-sm text-dark-400">
                  更新时间：{new Date(deviceData.timestamp).toLocaleString('zh-CN')}
                </p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-card p-6">
            <h3 className="text-base font-semibold text-dark-600 mb-4">基本信息</h3>
            <div className="grid grid-cols-2 gap-6">
              <InfoItem icon={MapPin} label="安装位置" value={device.location} />
              <InfoItem icon={Cpu} label="所属区域" value={device.area} />
              <InfoItem icon={Wifi} label="在线状态" value={device.status === 'online' ? '在线' : device.status === 'warning' ? '告警' : '离线'} />
              <InfoItem icon={Clock} label="创建时间" value={new Date(device.createdAt).toLocaleString('zh-CN')} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings size={18} className="text-primary-500" />
              <h3 className="text-base font-semibold text-dark-600">监测参数配置</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-dark-500">PM2.5 阈值</span>
                  <span className="text-sm font-semibold text-dark-600">{device.pm25Threshold} μg/m³</span>
                </div>
                <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full" style={{ width: `${Math.min((device.pm25Threshold / 200) * 100, 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-dark-500">PM10 阈值</span>
                  <span className="text-sm font-semibold text-dark-600">{device.pm10Threshold} μg/m³</span>
                </div>
                <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full" style={{ width: `${Math.min((device.pm10Threshold / 300) * 100, 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-dark-500">噪音阈值</span>
                  <span className="text-sm font-semibold text-dark-600">{device.noiseThreshold} dB</span>
                </div>
                <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full" style={{ width: `${Math.min((device.noiseThreshold / 100) * 100, 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Network size={18} className="text-primary-500" />
              <h3 className="text-base font-semibold text-dark-600">网络连接信息</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-dark-50">
                <span className="text-sm text-dark-400">IP 地址</span>
                <span className="text-sm font-medium text-dark-600 font-mono">{device.ipAddress}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-dark-50">
                <span className="text-sm text-dark-400">端口号</span>
                <span className="text-sm font-medium text-dark-600 font-mono">{device.port}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-dark-400">通信协议</span>
                <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-primary-50 text-primary-600 border border-primary-100 rounded">
                  {device.protocol}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={showEditModal}
        title="编辑设备"
        onClose={() => setShowEditModal(false)}
        width="max-w-3xl"
      >
        <DeviceForm
          initialData={device}
          onSubmit={handleUpdate}
          onCancel={() => setShowEditModal(false)}
          loading={loading}
        />
      </Modal>
    </div>
  );
}
