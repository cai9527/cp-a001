import { useEffect } from 'react';
import { useAppStore } from '@/store';
import {
  Cpu,
  Wifi,
  WifiOff,
  AlertTriangle,
  Wind,
  CloudRain,
  Volume2,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { DeviceStatusBadge, DataStatusBadge } from '@/components/StatusBadge';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ComponentType<any>;
  color: string;
  trend?: string;
  trendUp?: boolean;
}

function StatCard({ title, value, unit, icon: Icon, color, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-dark-400 mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-dark-600">{value}</span>
            {unit && <span className="text-sm text-dark-400">{unit}</span>}
          </div>
          {trend && (
            <div className={cn('flex items-center gap-1 mt-2 text-xs', trendUp ? 'text-success-600' : 'text-danger-600')}>
              <TrendingUp size={12} className={cn(!trendUp && 'rotate-180')} />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', color)}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { overviewStats, areaStats, monitoringData, fetchAllData } = useAppStore();

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 5000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  const dataStatusConfig = {
    normal: { icon: CheckCircle2, color: 'text-success-500', bg: 'bg-success-50' },
    warning: { icon: AlertCircle, color: 'text-warning-500', bg: 'bg-warning-50' },
    danger: { icon: XCircle, color: 'text-danger-500', bg: 'bg-danger-50' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-dark-600">数据概览</h2>
          <p className="text-sm text-dark-400 mt-1">实时监测全区域环境质量状况</p>
        </div>
        <button
          onClick={fetchAllData}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
        >
          <RefreshCw size={16} />
          刷新数据
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="设备总数"
          value={overviewStats?.totalDevices ?? 0}
          unit="台"
          icon={Cpu}
          color="bg-gradient-to-br from-primary-400 to-primary-600"
        />
        <StatCard
          title="在线设备"
          value={overviewStats?.onlineDevices ?? 0}
          unit="台"
          icon={Wifi}
          color="bg-gradient-to-br from-success-400 to-success-600"
        />
        <StatCard
          title="离线设备"
          value={overviewStats?.offlineDevices ?? 0}
          unit="台"
          icon={WifiOff}
          color="bg-gradient-to-br from-dark-300 to-dark-500"
        />
        <StatCard
          title="告警设备"
          value={overviewStats?.warningDevices ?? 0}
          unit="台"
          icon={AlertTriangle}
          color="bg-gradient-to-br from-warning-400 to-warning-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-card p-6">
          <h3 className="text-base font-semibold text-dark-600 mb-4">环境指标均值</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary-100 flex items-center justify-center mb-3">
                <Wind size={24} className="text-primary-500" />
              </div>
              <p className="text-sm text-dark-400 mb-1">PM2.5 均值</p>
              <p className="text-3xl font-bold text-dark-600">
                {overviewStats?.avgPm25 ?? 0}
                <span className="text-sm font-normal text-dark-400 ml-1">μg/m³</span>
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-purple-100 flex items-center justify-center mb-3">
                <CloudRain size={24} className="text-purple-500" />
              </div>
              <p className="text-sm text-dark-400 mb-1">PM10 均值</p>
              <p className="text-3xl font-bold text-dark-600">
                {overviewStats?.avgPm10 ?? 0}
                <span className="text-sm font-normal text-dark-400 ml-1">μg/m³</span>
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-orange-100 flex items-center justify-center mb-3">
                <Volume2 size={24} className="text-orange-500" />
              </div>
              <p className="text-sm text-dark-400 mb-1">噪音均值</p>
              <p className="text-3xl font-bold text-dark-600">
                {overviewStats?.avgNoise ?? 0}
                <span className="text-sm font-normal text-dark-400 ml-1">dB</span>
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-semibold text-dark-500 mb-3">数据状态分布</h4>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-3 rounded-full bg-dark-100 overflow-hidden flex">
                <div
                  className="h-full bg-success-500 transition-all duration-500"
                  style={{ width: `${overviewStats ? (overviewStats.normalCount / Math.max(monitoringData.length, 1)) * 100 : 0}%` }}
                />
                <div
                  className="h-full bg-warning-500 transition-all duration-500"
                  style={{ width: `${overviewStats ? (overviewStats.warningCount / Math.max(monitoringData.length, 1)) * 100 : 0}%` }}
                />
                <div
                  className="h-full bg-danger-500 transition-all duration-500"
                  style={{ width: `${overviewStats ? (overviewStats.dangerCount / Math.max(monitoringData.length, 1)) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-success-500" />
                <span className="text-xs text-dark-400">正常 {overviewStats?.normalCount ?? 0}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-warning-500" />
                <span className="text-xs text-dark-400">预警 {overviewStats?.warningCount ?? 0}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-danger-500" />
                <span className="text-xs text-dark-400">异常 {overviewStats?.dangerCount ?? 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <h3 className="text-base font-semibold text-dark-600 mb-4">各区域数据统计</h3>
          <div className="space-y-5">
            {areaStats.map((area) => (
              <div key={area.area} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-dark-500">{area.area}</span>
                  <span className="text-xs text-dark-400">{area.deviceCount} 台设备</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-dark-400 w-12">PM2.5</span>
                    <div className="flex-1 h-2 rounded-full bg-dark-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((area.avgPm25 / 200) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-dark-500 w-12 text-right">{area.avgPm25}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-dark-400 w-12">PM10</span>
                    <div className="flex-1 h-2 rounded-full bg-dark-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((area.avgPm10 / 300) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-dark-500 w-12 text-right">{area.avgPm10}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-dark-400 w-12">噪音</span>
                    <div className="flex-1 h-2 rounded-full bg-dark-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((area.avgNoise / 100) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-dark-500 w-12 text-right">{area.avgNoise}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-100">
          <h3 className="text-base font-semibold text-dark-600">实时监测数据</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">设备名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">PM2.5 (μg/m³)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">PM10 (μg/m³)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">噪音 (dB)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">数据状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-400 uppercase tracking-wider">更新时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {monitoringData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-dark-400">
                    暂无监测数据
                  </td>
                </tr>
              ) : (
                monitoringData.map((data) => {
                  const device = useAppStore.getState().devices.find((d) => d.id === data.deviceId);
                  const StatusIcon = dataStatusConfig[data.status].icon;
                  return (
                    <tr key={data.deviceId} className="hover:bg-dark-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', dataStatusConfig[data.status].bg)}>
                            <StatusIcon size={16} className={dataStatusConfig[data.status].color} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-dark-600">{data.deviceName}</p>
                            {device && <p className="text-xs text-dark-400">{device.area} · {device.location}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {device && <DeviceStatusBadge status={device.status} />}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          'text-sm font-semibold',
                          data.pm25 > 100 ? 'text-danger-600' : data.pm25 > 75 ? 'text-warning-600' : 'text-dark-600',
                        )}>
                          {data.pm25}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          'text-sm font-semibold',
                          data.pm10 > 200 ? 'text-danger-600' : data.pm10 > 150 ? 'text-warning-600' : 'text-dark-600',
                        )}>
                          {data.pm10}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          'text-sm font-semibold',
                          data.noise > 80 ? 'text-danger-600' : data.noise > 70 ? 'text-warning-600' : 'text-dark-600',
                        )}>
                          {data.noise}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <DataStatusBadge status={data.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-400">
                        {new Date(data.timestamp).toLocaleTimeString('zh-CN')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
