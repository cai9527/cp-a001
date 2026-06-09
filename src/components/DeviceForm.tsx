import { useState, type FormEvent } from 'react';
import type { CreateDeviceRequest, Device, Protocol } from '../../shared/types';
import { Info, Settings, Network } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeviceFormProps {
  initialData?: Device;
  onSubmit: (data: CreateDeviceRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

type TabType = 'basic' | 'params' | 'network';

export default function DeviceForm({ initialData, onSubmit, onCancel, loading }: DeviceFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [formData, setFormData] = useState<CreateDeviceRequest>({
    name: initialData?.name ?? '',
    code: initialData?.code ?? '',
    location: initialData?.location ?? '',
    area: initialData?.area ?? '东区',
    pm25Threshold: initialData?.pm25Threshold ?? 75,
    pm10Threshold: initialData?.pm10Threshold ?? 150,
    noiseThreshold: initialData?.noiseThreshold ?? 70,
    ipAddress: initialData?.ipAddress ?? '',
    port: initialData?.port ?? 1883,
    protocol: initialData?.protocol ?? 'MQTT',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateDeviceRequest, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateDeviceRequest, string>> = {};
    if (!formData.name.trim()) newErrors.name = '请输入设备名称';
    if (!formData.code.trim()) newErrors.code = '请输入设备编号';
    if (!formData.location.trim()) newErrors.location = '请输入安装位置';
    if (!formData.ipAddress.trim()) newErrors.ipAddress = '请输入IP地址';
    else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(formData.ipAddress)) newErrors.ipAddress = 'IP地址格式不正确';
    if (!formData.port) newErrors.port = '请输入端口号';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  const tabs: { key: TabType; label: string; icon: React.ComponentType<any> }[] = [
    { key: 'basic', label: '基本信息', icon: Info },
    { key: 'params', label: '监测参数', icon: Settings },
    { key: 'network', label: '网络配置', icon: Network },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex gap-1 bg-dark-50 rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                activeTab === tab.key
                  ? 'bg-white text-primary-500 shadow-sm'
                  : 'text-dark-400 hover:text-dark-600',
              )}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'basic' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-dark-500 mb-1.5">设备名称 <span className="text-danger-500">*</span></label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="例如：东区一号监测站"
              className={cn(
                'w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all',
                errors.name ? 'border-danger-500' : 'border-dark-200 focus:border-primary-500',
              )}
            />
            {errors.name && <p className="mt-1 text-xs text-danger-500">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-500 mb-1.5">设备编号 <span className="text-danger-500">*</span></label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="例如：YC-EAST-001"
              className={cn(
                'w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all',
                errors.code ? 'border-danger-500' : 'border-dark-200 focus:border-primary-500',
              )}
            />
            {errors.code && <p className="mt-1 text-xs text-danger-500">{errors.code}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-500 mb-1.5">所属区域</label>
            <select
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-dark-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
            >
              <option value="东区">东区</option>
              <option value="西区">西区</option>
              <option value="南区">南区</option>
              <option value="北区">北区</option>
              <option value="中区">中区</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-dark-500 mb-1.5">安装位置 <span className="text-danger-500">*</span></label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="请输入详细安装位置"
              className={cn(
                'w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all',
                errors.location ? 'border-danger-500' : 'border-dark-200 focus:border-primary-500',
              )}
            />
            {errors.location && <p className="mt-1 text-xs text-danger-500">{errors.location}</p>}
          </div>
        </div>
      )}

      {activeTab === 'params' && (
        <div className="space-y-4">
          <div className="p-4 bg-primary-50/50 rounded-lg border border-primary-100">
            <p className="text-sm text-dark-500">配置各项监测指标的报警阈值，当监测数值超过阈值时系统将自动触发告警。</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-500 mb-1.5">PM2.5 阈值 (μg/m³)</label>
              <input
                type="number"
                value={formData.pm25Threshold}
                onChange={(e) => setFormData({ ...formData, pm25Threshold: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 border border-dark-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-500 mb-1.5">PM10 阈值 (μg/m³)</label>
              <input
                type="number"
                value={formData.pm10Threshold}
                onChange={(e) => setFormData({ ...formData, pm10Threshold: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 border border-dark-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-500 mb-1.5">噪音阈值 (dB)</label>
              <input
                type="number"
                value={formData.noiseThreshold}
                onChange={(e) => setFormData({ ...formData, noiseThreshold: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 border border-dark-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'network' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-500 mb-1.5">IP 地址 <span className="text-danger-500">*</span></label>
            <input
              type="text"
              value={formData.ipAddress}
              onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
              placeholder="例如：192.168.1.101"
              className={cn(
                'w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all',
                errors.ipAddress ? 'border-danger-500' : 'border-dark-200 focus:border-primary-500',
              )}
            />
            {errors.ipAddress && <p className="mt-1 text-xs text-danger-500">{errors.ipAddress}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-500 mb-1.5">端口号 <span className="text-danger-500">*</span></label>
            <input
              type="number"
              value={formData.port}
              onChange={(e) => setFormData({ ...formData, port: Number(e.target.value) })}
              placeholder="例如：1883"
              className={cn(
                'w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all',
                errors.port ? 'border-danger-500' : 'border-dark-200 focus:border-primary-500',
              )}
            />
            {errors.port && <p className="mt-1 text-xs text-danger-500">{errors.port}</p>}
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-dark-500 mb-1.5">通信协议</label>
            <div className="grid grid-cols-3 gap-3">
              {(['MQTT', 'HTTP', 'Modbus'] as Protocol[]).map((proto) => (
                <label
                  key={proto}
                  className={cn(
                    'flex items-center justify-center px-4 py-3 border-2 rounded-lg cursor-pointer transition-all',
                    formData.protocol === proto
                      ? 'border-primary-500 bg-primary-50 text-primary-600'
                      : 'border-dark-200 hover:border-dark-300 text-dark-500',
                  )}
                >
                  <input
                    type="radio"
                    name="protocol"
                    value={proto}
                    checked={formData.protocol === proto}
                    onChange={(e) => setFormData({ ...formData, protocol: e.target.value as Protocol })}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{proto}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 text-sm font-medium text-dark-500 bg-dark-50 hover:bg-dark-100 rounded-lg transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          {loading ? '保存中...' : initialData ? '保存修改' : '创建设备'}
        </button>
      </div>
    </form>
  );
}
