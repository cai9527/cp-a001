import { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { RefreshCw, Wind, CloudRain, Volume2, MapPin, Clock, Activity } from 'lucide-react';
import { DeviceStatusBadge, DataStatusBadge } from '@/components/StatusBadge';
import { cn } from '@/lib/utils';
import type { MonitoringData } from '../../shared/types';

interface DataCardProps {
  data: MonitoringData;
  device?: ReturnType<typeof useAppStore.getState>['devices'][number];
}

function DataCard({ data, device }: DataCardProps) {
  const statusConfig = {
    normal: {
      border: 'border-success-200',
      bg: 'bg-success-50/30',
      glow: 'shadow-success-500/10',
    },
    warning: {
      border: 'border-warning-200',
      bg: 'bg-warning-50/30',
      glow: 'shadow-warning-500/10',
    },
    danger: {
      border: 'border-danger-200',
      bg: 'bg-danger-50/30',
      glow: 'shadow-danger-500/20',
    },
  };

  const config = statusConfig[data.status];

  const getValueColor = (value: number, threshold: number, dangerMultiplier: number = 1.3) => {
    if (value > threshold * dangerMultiplier) return 'text-danger-600';
    if (value > threshold) return 'text-warning-600';
    return 'text-dark-600';
  };

  const getProgressColor = (value: number, max: number, threshold: number) => {
    const percent = Math.min((value / max) * 100, 100);
    if (value > threshold * 1.3) return { percent, color: 'bg-gradient-to-r from-danger-400 to-danger-600' };
    if (value > threshold) return { percent, color: 'bg-gradient-to-r from-warning-400 to-warning-600' };
    return { percent, color: 'bg-gradient-to-r from-success-400 to-success-600' };
  };

  const pm25Progress = getProgressColor(data.pm25, 200, device?.pm25Threshold ?? 75);
  const pm10Progress = getProgressColor(data.pm10, 300, device?.pm10Threshold ?? 150);
  const noiseProgress = getProgressColor(data.noise, 100, device?.noiseThreshold ?? 70);

  return (
    <div className={cn(
      'bg-white rounded-2xl shadow-card hover:shadow-card-hover border transition-all duration-300 overflow-hidden',
      config.border,
      data.status === 'danger' && 'animate-pulse-slow',
    )}>
      <div className={cn('px-5 py-4 border-b border-dark-100 flex items-center justify-between', config.bg)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Activity size={20} className="text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-dark-600 text-sm">{data.deviceName}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <MapPin size={10} className="text-dark-300" />
              <span className="text-xs text-dark-400">{device?.area || '未知区域'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {device && <DeviceStatusBadge status={device.status} />}
          <DataStatusBadge status={data.status} />
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-primary-50 flex items-center justify-center mb-2">
              <Wind size={18} className="text-primary-500" />
            </div>
            <p className="text-xs text-dark-400 mb-1">PM2.5</p>
            <p className={cn('text-2xl font-bold', getValueColor(data.pm25, device?.pm25Threshold ?? 75))}>
              {data.pm25}
            </p>
            <p className="text-xs text-dark-300">μg/m³</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-purple-50 flex items-center justify-center mb-2">
              <CloudRain size={18} className="text-purple-500" />
            </div>
            <p className="text-xs text-dark-400 mb-1">PM10</p>
            <p className={cn('text-2xl font-bold', getValueColor(data.pm10, device?.pm10Threshold ?? 150))}>
              {data.pm10}
            </p>
            <p className="text-xs text-dark-300">μg/m³</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-orange-50 flex items-center justify-center mb-2">
              <Volume2 size={18} className="text-orange-500" />
            </div>
            <p className="text-xs text-dark-400 mb-1">噪音</p>
            <p className={cn('text-2xl font-bold', getValueColor(data.noise, device?.noiseThreshold ?? 70, 1.2))}>
              {data.noise}
            </p>
            <p className="text-xs text-dark-300">dB</p>
          </div>
        </div>

        <div className="space-y-2.5 pt-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-dark-400">PM2.5 浓度</span>
              <span className="text-xs text-dark-400">阈值: {device?.pm25Threshold ?? 75}</span>
            </div>
            <div className="h-1.5 bg-dark-100 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-700', pm25Progress.color)}
                style={{ width: `${pm25Progress.percent}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-dark-400">PM10 浓度</span>
              <span className="text-xs text-dark-400">阈值: {device?.pm10Threshold ?? 150}</span>
            </div>
            <div className="h-1.5 bg-dark-100 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-700', pm10Progress.color)}
                style={{ width: `${pm10Progress.percent}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-dark-400">噪音水平</span>
              <span className="text-xs text-dark-400">阈值: {device?.noiseThreshold ?? 70}</span>
            </div>
            <div className="h-1.5 bg-dark-100 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-700', noiseProgress.color)}
                style={{ width: `${noiseProgress.percent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 pt-2 border-t border-dark-50">
          <Clock size={12} className="text-dark-300" />
          <span className="text-xs text-dark-400">
            更新于 {new Date(data.timestamp).toLocaleTimeString('zh-CN')}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Realtime() {
  const { devices, monitoringData, fetchDevices, fetchMonitoringData } = useAppStore();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchDevices();
    fetchMonitoringData();
  }, [fetchDevices, fetchMonitoringData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchMonitoringData();
      setLastUpdate(new Date());
    }, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchMonitoringData]);

  const handleRefresh = () => {
    fetchMonitoringData();
    setLastUpdate(new Date());
  };

  const sortedData = [...monitoringData].sort((a, b) => {
    const priority = { danger: 0, warning: 1, normal: 2 };
    return priority[a.status] - priority[b.status];
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-dark-600">实时数据监测</h2>
          <p className="text-sm text-dark-400 mt-1">
            实时展示各监测设备数据，每 3 秒自动刷新
            {lastUpdate && <span className="ml-2">· 最后更新: {lastUpdate.toLocaleTimeString('zh-CN')}</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-dark-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 rounded border-dark-300 text-primary-500 focus:ring-primary-500/20"
            />
            自动刷新
          </label>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
          >
            <RefreshCw size={16} className={cn(autoRefresh && 'animate-spin')} />
            立即刷新
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {sortedData.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-card p-12 text-center">
            <p className="text-dark-400">暂无监测数据，设备可能处于离线状态</p>
          </div>
        ) : (
          sortedData.map((data) => {
            const device = devices.find((d) => d.id === data.deviceId);
            return <DataCard key={data.deviceId} data={data} device={device} />;
          })
        )}
      </div>
    </div>
  );
}
