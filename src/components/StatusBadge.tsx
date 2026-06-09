import type { DeviceStatus, DataStatus } from '../../shared/types';

interface DeviceStatusBadgeProps {
  status: DeviceStatus;
}

export function DeviceStatusBadge({ status }: DeviceStatusBadgeProps) {
  const config = {
    online: { label: '在线', className: 'bg-success-50 text-success-600 border-success-500/30 dot:bg-success-500' },
    offline: { label: '离线', className: 'bg-dark-50 text-dark-400 border-dark-300/30 dot:bg-dark-300' },
    warning: { label: '告警', className: 'bg-warning-50 text-warning-600 border-warning-500/30 dot:bg-warning-500' },
  };

  const { label, className } = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border rounded ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

interface DataStatusBadgeProps {
  status: DataStatus;
}

export function DataStatusBadge({ status }: DataStatusBadgeProps) {
  const config = {
    normal: { label: '正常', className: 'bg-success-50 text-success-600 border-success-500/30' },
    warning: { label: '预警', className: 'bg-warning-50 text-warning-600 border-warning-500/30' },
    danger: { label: '异常', className: 'bg-danger-50 text-danger-600 border-danger-500/30' },
  };

  const { label, className } = config[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium border rounded ${className}`}>
      {label}
    </span>
  );
}
