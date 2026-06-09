import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAppStore } from '@/store';
import FilterBar from '@/components/DataFilterBar';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import HeatmapChart from '@/components/charts/HeatmapChart';
import ChartCard from '@/components/charts/ChartCard';
import StatCard from '@/components/StatCard';
import {
  Cpu,
  Wifi,
  AlertTriangle,
  Wind,
  CloudRain,
  Volume2,
  Activity,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MetricType, TimeRange, DataStatus } from '../../shared/types';

const METRIC_CONFIG: Record<MetricType, { label: string; unit: string; threshold: number }> = {
  pm25: { label: 'PM2.5', unit: 'μg/m³', threshold: 75 },
  pm10: { label: 'PM10', unit: 'μg/m³', threshold: 150 },
  noise: { label: '噪音', unit: 'dB', threshold: 70 },
};

const STATUS_LABEL: Record<DataStatus, string> = {
  normal: '正常',
  warning: '预警',
  danger: '异常',
};

const STATUS_COLOR: Record<DataStatus, string> = {
  normal: '#00B42A',
  warning: '#FF7D00',
  danger: '#F53F3F',
};

export default function DataVisualization() {
  const {
    devices,
    monitoringData,
    overviewStats,
    areaTimeSeries,
    statusDistribution,
    deviceStatusDistribution,
    heatmapData,
    fetchDevices,
    fetchAllVisualizationData,
  } = useAppStore();

  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>(['pm25', 'pm10', 'noise']);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [selectedStatuses, setSelectedStatuses] = useState<DataStatus[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [heatmapMetric, setHeatmapMetric] = useState<MetricType>('pm25');

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleRefresh = useCallback(() => {
    fetchAllVisualizationData({
      deviceIds: selectedDevices.length > 0 ? selectedDevices : undefined,
      areas: selectedAreas.length > 0 ? selectedAreas : undefined,
      timeRange,
      metric: heatmapMetric,
    });
    setLastUpdate(new Date());
  }, [fetchAllVisualizationData, selectedDevices, selectedAreas, timeRange, heatmapMetric]);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(handleRefresh, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh, handleRefresh]);

  const handleReset = () => {
    setSelectedAreas([]);
    setSelectedDevices([]);
    setSelectedStatuses([]);
    setSelectedMetrics(['pm25', 'pm10', 'noise']);
    setTimeRange('24h');
  };

  const filteredMonitoringData = useMemo(() => {
    return monitoringData.filter((d) => {
      if (selectedAreas.length > 0) {
        const device = devices.find((dev) => dev.id === d.deviceId);
        if (!device || !selectedAreas.includes(device.area)) return false;
      }
      if (selectedDevices.length > 0 && !selectedDevices.includes(d.deviceId)) return false;
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(d.status)) return false;
      return true;
    });
  }, [monitoringData, devices, selectedAreas, selectedDevices, selectedStatuses]);

  const lineSeries = useMemo(() => {
    const series: Array<{ name: string; data: Array<{ time: string; value: number }> }> = [];
    const filtered = areaTimeSeries.filter((a) => selectedAreas.length === 0 || selectedAreas.includes(a.area));
    filtered.forEach((area) => {
      selectedMetrics.forEach((metric) => {
        const data = area[metric].map((p) => ({
          time: new Date(p.timestamp).toLocaleTimeString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
          value: p.value,
        }));
        series.push({
          name: area.area + ' - ' + METRIC_CONFIG[metric].label,
          data,
        });
      });
    });
    return series;
  }, [areaTimeSeries, selectedAreas, selectedMetrics]);

  const deviceTrendSeries = useMemo(() => {
    const series: Array<{ name: string; data: Array<{ category: string; value: number }> }> = [];
    selectedMetrics.forEach((metric) => {
      const data = filteredMonitoringData.map((d) => ({
        category: d.deviceName,
        value: d[metric],
      }));
      series.push({
        name: METRIC_CONFIG[metric].label,
        data,
      });
    });
    return series;
  }, [filteredMonitoringData, selectedMetrics]);

  const areaBarData = useMemo(() => {
    const series: Array<{ name: string; data: Array<{ category: string; value: number }> }> = [];
    const areas = [...new Set(devices.map((d) => d.area))];
    const filteredAreas = selectedAreas.length > 0 ? selectedAreas : areas;

    selectedMetrics.forEach((metric) => {
      const data = filteredAreas.map((area) => {
        const areaDevices = devices.filter((d) => d.area === area);
        const areaData = filteredMonitoringData.filter((md) =>
          areaDevices.some((ad) => ad.id === md.deviceId),
        );
        const avg = areaData.length
          ? areaData.reduce((s, d) => s + d[metric], 0) / areaData.length
          : 0;
        return { category: area, value: Number(avg.toFixed(1)) };
      });
      series.push({ name: METRIC_CONFIG[metric].label, data });
    });
    return series;
  }, [filteredMonitoringData, devices, selectedAreas, selectedMetrics]);

  const statusPieData = useMemo(() => {
    return statusDistribution.map((s) => ({
      name: STATUS_LABEL[s.status],
      value: s.count,
      color: STATUS_COLOR[s.status],
    }));
  }, [statusDistribution]);

  const deviceStatusPieData = useMemo(() => {
    const labelMap: Record<string, string> = { online: '在线', offline: '离线', warning: '告警' };
    const colorMap: Record<string, string> = { online: '#00B42A', offline: '#86909C', warning: '#FF7D00' };
    return deviceStatusDistribution.map((s) => ({
      name: labelMap[s.status] || s.status,
      value: s.count,
      color: colorMap[s.status] || '#165DFF',
    }));
  }, [deviceStatusDistribution]);

  const heatmapPrepared = useMemo(() => {
    if (heatmapData.length === 0) return { deviceNames: [] as string[], timestamps: [] as string[], data: [] as Array<{ x: number; y: number; value: number }> };
    const deviceNames = heatmapData.map((d) => d.deviceName);
    const timestamps = heatmapData[0].timestamps;
    const data: Array<{ x: number; y: number; value: number }> = [];
    heatmapData.forEach((deviceData, yIdx) => {
      deviceData.values.forEach((val, xIdx) => {
        data.push({ x: xIdx, y: yIdx, value: val });
      });
    });
    return { deviceNames, timestamps, data };
  }, [heatmapData]);

  const avgPm25 = useMemo(() => {
    if (filteredMonitoringData.length === 0) return 0;
    return filteredMonitoringData.reduce((s, d) => s + d.pm25, 0) / filteredMonitoringData.length;
  }, [filteredMonitoringData]);

  const avgPm10 = useMemo(() => {
    if (filteredMonitoringData.length === 0) return 0;
    return filteredMonitoringData.reduce((s, d) => s + d.pm10, 0) / filteredMonitoringData.length;
  }, [filteredMonitoringData]);

  const avgNoise = useMemo(() => {
    if (filteredMonitoringData.length === 0) return 0;
    return filteredMonitoringData.reduce((s, d) => s + d.noise, 0) / filteredMonitoringData.length;
  }, [filteredMonitoringData]);

  const calcTrend = (avg: number, threshold: number) => {
    if (avg === 0) return undefined;
    if (avg > threshold) {
      return ((avg / threshold - 1) * 100);
    }
    return ((threshold / avg - 1) * -100);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dark-600">多维度数据可视化</h2>
          <p className="text-sm text-dark-400 mt-1">
            实时监测全区域环境质量数据，每 3 秒自动更新
            {lastUpdate && (
              <span className="ml-2 text-primary-500 font-medium">
                · 最后更新: {lastUpdate.toLocaleTimeString('zh-CN')}
              </span>
            )}
          </p>
        </div>
      </div>

      <FilterBar
        devices={devices}
        selectedAreas={selectedAreas}
        selectedDevices={selectedDevices}
        selectedMetrics={selectedMetrics}
        timeRange={timeRange}
        selectedStatuses={selectedStatuses}
        autoRefresh={autoRefresh}
        lastUpdate={lastUpdate}
        onAreasChange={setSelectedAreas}
        onDevicesChange={setSelectedDevices}
        onMetricsChange={setSelectedMetrics}
        onTimeRangeChange={setTimeRange}
        onStatusesChange={setSelectedStatuses}
        onAutoRefreshChange={setAutoRefresh}
        onRefresh={handleRefresh}
        onReset={handleReset}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 3xl:grid-cols-6 gap-4 3xl:gap-5">
        <StatCard
          variant="bordered"
          title="设备总数"
          value={overviewStats?.totalDevices ?? 0}
          unit="台"
          icon={Cpu}
          color="bg-gradient-to-br from-primary-400 to-primary-600"
        />
        <StatCard
          variant="bordered"
          title="在线设备"
          value={overviewStats?.onlineDevices ?? 0}
          unit="台"
          icon={Wifi}
          color="bg-gradient-to-br from-success-400 to-success-600"
        />
        <StatCard
          variant="bordered"
          title="告警设备"
          value={overviewStats?.warningDevices ?? 0}
          unit="台"
          icon={AlertTriangle}
          color="bg-gradient-to-br from-warning-400 to-warning-600"
        />
        <StatCard
          variant="bordered"
          title="PM2.5 均值"
          value={avgPm25.toFixed(1)}
          unit="μg/m³"
          icon={Wind}
          color="bg-gradient-to-br from-blue-400 to-blue-600"
          trend={calcTrend(avgPm25, METRIC_CONFIG.pm25.threshold)}
        />
        <StatCard
          variant="bordered"
          title="PM10 均值"
          value={avgPm10.toFixed(1)}
          unit="μg/m³"
          icon={CloudRain}
          color="bg-gradient-to-br from-purple-400 to-purple-600"
          trend={calcTrend(avgPm10, METRIC_CONFIG.pm10.threshold)}
        />
        <StatCard
          variant="bordered"
          title="噪音均值"
          value={avgNoise.toFixed(1)}
          unit="dB"
          icon={Volume2}
          color="bg-gradient-to-br from-orange-400 to-orange-600"
          trend={calcTrend(avgNoise, METRIC_CONFIG.noise.threshold)}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <ChartCard
          className="xl:col-span-2"
          title="区域环境指标趋势"
          subtitle="时间趋势分析"
          extra={
            <div className="flex items-center gap-2 text-xs text-dark-400">
              <Activity size={14} className="text-success-500" />
              实时趋势
            </div>
          }
        >
          {lineSeries.length > 0 ? (
            <LineChart
              series={lineSeries}
              height={340}
              areaStyle
              yAxisName="浓度值"
            />
          ) : (
            <div className="h-[340px] flex items-center justify-center text-dark-300 text-sm">
              暂无数据
            </div>
          )}
        </ChartCard>

        <ChartCard title="数据状态分布" subtitle="各状态设备占比">
          <PieChart data={statusPieData} height={340} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <ChartCard title="各区域指标对比">
          {areaBarData.length > 0 ? (
            <BarChart
              series={areaBarData}
              height={320}
              yAxisName="浓度值"
            />
          ) : (
            <div className="h-[320px] flex items-center justify-center text-dark-300 text-sm">
              暂无数据
            </div>
          )}
        </ChartCard>

        <ChartCard title="设备运行状态" subtitle="设备在线情况统计">
          <PieChart data={deviceStatusPieData} height={320} donut={false} />
        </ChartCard>

        <ChartCard
          title="各设备实时数值"
          subtitle="设备维度数据对比"
          extra={
            <div className="flex items-center gap-2">
              <BarChart3 size={14} className="text-primary-500" />
            </div>
          }
        >
          {deviceTrendSeries.length > 0 ? (
            <BarChart
              series={deviceTrendSeries}
              height={320}
              horizontal
              showValue={false}
            />
          ) : (
            <div className="h-[320px] flex items-center justify-center text-dark-300 text-sm">
              暂无数据
            </div>
          )}
        </ChartCard>
      </div>

      <ChartCard
        title="设备热力图"
        subtitle="各设备不同时间点的指标分布情况"
        extra={
          <div className="flex items-center gap-2">
            {(['pm25', 'pm10', 'noise'] as MetricType[]).map((m) => (
              <button
                key={m}
                onClick={() => setHeatmapMetric(m)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  heatmapMetric === m
                    ? 'bg-primary-50 text-primary-600 border border-primary-200'
                    : 'bg-white text-dark-400 border border-dark-200 hover:text-dark-600',
                )}
              >
                {METRIC_CONFIG[m].label}
              </button>
            ))}
          </div>
        }
      >
        {heatmapPrepared.deviceNames.length > 0 ? (
          <HeatmapChart
            deviceNames={heatmapPrepared.deviceNames}
            timestamps={heatmapPrepared.timestamps}
            data={heatmapPrepared.data}
            height={380}
            minValue={0}
            maxValue={heatmapMetric === 'noise' ? 100 : heatmapMetric === 'pm10' ? 300 : 200}
            unit={METRIC_CONFIG[heatmapMetric].unit}
          />
        ) : (
          <div className="h-[380px] flex items-center justify-center text-dark-300 text-sm">
            暂无数据
          </div>
        )}
      </ChartCard>
    </div>
  );
}
