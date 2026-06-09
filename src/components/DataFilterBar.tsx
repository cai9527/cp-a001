import { useMemo, useState } from 'react';
import { RefreshCw, Filter, X, ChevronDown, ChevronRight, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Device, MetricType, TimeRange, DataStatus } from '../../shared/types';

interface FilterBarProps {
  devices: Device[];
  selectedAreas: string[];
  selectedDevices: string[];
  selectedMetrics: MetricType[];
  timeRange: TimeRange;
  selectedStatuses: DataStatus[];
  autoRefresh: boolean;
  lastUpdate: Date | null;
  onAreasChange: (areas: string[]) => void;
  onDevicesChange: (devices: string[]) => void;
  onMetricsChange: (metrics: MetricType[]) => void;
  onTimeRangeChange: (range: TimeRange) => void;
  onStatusesChange: (statuses: DataStatus[]) => void;
  onAutoRefreshChange: (enabled: boolean) => void;
  onRefresh: () => void;
  onReset: () => void;
}

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '1h', label: '近1小时' },
  { value: '6h', label: '近6小时' },
  { value: '12h', label: '近12小时' },
  { value: '24h', label: '近24小时' },
  { value: '7d', label: '近7天' },
];

const METRICS: { value: MetricType; label: string; color: string }[] = [
  { value: 'pm25', label: 'PM2.5', color: 'bg-primary-500' },
  { value: 'pm10', label: 'PM10', color: 'bg-purple-500' },
  { value: 'noise', label: '噪音', color: 'bg-orange-500' },
];

const STATUSES: { value: DataStatus; label: string; color: string; bg: string }[] = [
  { value: 'normal', label: '正常', color: 'text-success-600', bg: 'bg-success-50' },
  { value: 'warning', label: '预警', color: 'text-warning-600', bg: 'bg-warning-50' },
  { value: 'danger', label: '异常', color: 'text-danger-600', bg: 'bg-danger-50' },
];

function MultiSelectDropdown<T extends string>({
  label,
  icon,
  options,
  selected,
  onChange,
  renderOption,
}: {
  label: string;
  icon?: React.ReactNode;
  options: { value: T; label: string; color?: string; bg?: string }[];
  selected: T[];
  onChange: (values: T[]) => void;
  renderOption?: (opt: { value: T; label: string; color?: string; bg?: string }) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const toggleOption = (value: T) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const displayText = selected.length === 0
    ? '全部'
    : selected.length === options.length
      ? '全部'
      : `已选 ${selected.length} 项`;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm transition-all min-w-[140px]',
          open
            ? 'border-primary-300 bg-primary-50 text-primary-600'
            : 'border-dark-200 bg-white text-dark-500 hover:border-primary-300 hover:text-primary-600',
        )}
      >
        {icon}
        <span className="text-xs text-dark-400">{label}:</span>
        <span className={cn('font-medium', selected.length > 0 && selected.length < options.length && 'text-primary-600')}>
          {displayText}
        </span>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-2 z-20 bg-white rounded-xl shadow-card-hover border border-dark-100 py-2 min-w-full max-h-64 overflow-y-auto animate-slide-up">
            {options.map((opt) => {
              const checked = selected.includes(opt.value) || selected.length === 0;
              return (
                <button
                  key={opt.value}
                  onClick={() => toggleOption(opt.value)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-4 py-2 text-left text-sm transition-colors hover:bg-dark-50',
                    checked && 'bg-primary-50/50',
                  )}
                >
                  <div
                    className={cn(
                      'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                      checked
                        ? 'bg-primary-500 border-primary-500'
                        : 'border-dark-200 hover:border-primary-400',
                    )}
                  >
                    {checked && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  {renderOption ? renderOption(opt) : (
                    <span className={cn(opt.color || 'text-dark-500')}>{opt.label}</span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function FilterBar({
  devices,
  selectedAreas,
  selectedDevices,
  selectedMetrics,
  timeRange,
  selectedStatuses,
  autoRefresh,
  lastUpdate,
  onAreasChange,
  onDevicesChange,
  onMetricsChange,
  onTimeRangeChange,
  onStatusesChange,
  onAutoRefreshChange,
  onRefresh,
  onReset,
}: FilterBarProps) {
  const areaOptions = useMemo(() => {
    const areas = [...new Set(devices.map((d) => d.area))];
    return areas.map((a) => ({ value: a, label: a }));
  }, [devices]);

  const deviceOptions = useMemo(() => {
    return devices
      .filter((d) => d.status !== 'offline')
      .filter((d) => selectedAreas.length === 0 || selectedAreas.includes(d.area))
      .map((d) => ({ value: d.id, label: d.name }));
  }, [devices, selectedAreas]);

  const hasActiveFilters = selectedAreas.length > 0 || selectedDevices.length > 0 || selectedStatuses.length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-card border border-dark-50 p-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 pr-3 border-r border-dark-100">
          <Filter size={16} className="text-primary-500" />
          <span className="text-sm font-semibold text-dark-600">数据筛选</span>
        </div>

        <MultiSelectDropdown
          label="区域"
          options={areaOptions}
          selected={selectedAreas}
          onChange={onAreasChange}
        />

        <MultiSelectDropdown
          label="设备"
          options={deviceOptions}
          selected={selectedDevices}
          onChange={onDevicesChange}
        />

        <MultiSelectDropdown
          label="指标"
          options={METRICS}
          selected={selectedMetrics}
          onChange={onMetricsChange}
          renderOption={(opt) => (
            <span className="flex items-center gap-2">
              <span className={cn('w-2 h-2 rounded-full', opt.color)} />
              <span className="text-dark-500">{opt.label}</span>
            </span>
          )}
        />

        <MultiSelectDropdown
          label="状态"
          options={STATUSES}
          selected={selectedStatuses}
          onChange={onStatusesChange}
          renderOption={(opt) => (
            <span className={cn('flex items-center gap-2', opt.color)}>
              <span className={cn('w-2 h-2 rounded-full', opt.bg?.replace('-50', '-500'))} />
              {opt.label}
            </span>
          )}
        />

        <div className="flex items-center gap-1.5 bg-dark-50 rounded-lg p-1">
          {TIME_RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => onTimeRangeChange(r.value)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                timeRange === r.value
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-dark-400 hover:text-dark-600',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-3">
          {lastUpdate && (
            <div className="text-xs text-dark-400">
              最后更新: {lastUpdate.toLocaleTimeString('zh-CN')}
            </div>
          )}

          <button
            onClick={() => onAutoRefreshChange(!autoRefresh)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
              autoRefresh
                ? 'bg-success-50 text-success-600 border border-success-200'
                : 'bg-white text-dark-400 border border-dark-200 hover:text-dark-600',
            )}
            title={autoRefresh ? '暂停自动刷新' : '开启自动刷新'}
          >
            {autoRefresh ? <Play size={14} /> : <Pause size={14} />}
            {autoRefresh ? '实时更新中' : '已暂停'}
          </button>

          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium shadow-sm shadow-primary-500/20"
          >
            <RefreshCw size={14} className={cn(autoRefresh && 'animate-spin')} />
            立即刷新
          </button>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 px-3 py-2 text-sm text-dark-400 hover:text-danger-500 transition-colors"
            >
              <X size={14} />
              重置筛选
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
