import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  color: string;
  trend?: string | number;
  trendLabel?: string;
  trendUp?: boolean;
  variant?: 'default' | 'bordered';
  className?: string;
}

export default function StatCard({
  title,
  value,
  unit,
  icon: Icon,
  color,
  trend,
  trendLabel,
  trendUp,
  variant = 'default',
  className,
}: StatCardProps) {
  const isTrendPositive = trendUp ?? (typeof trend === 'number' ? trend >= 0 : true);
  const trendValue = typeof trend === 'number' ? `${Math.abs(trend).toFixed(1)}%` : trend;
  const defaultTrendLabel = typeof trend === 'number'
    ? (isTrendPositive ? '偏高' : '下降')
    : undefined;

  return (
    <div className={cn(
      'bg-white shadow-card hover:shadow-card-hover transition-all duration-300',
      variant === 'default' ? 'rounded-xl p-5' : 'rounded-2xl border border-dark-50 p-6',
      className,
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className={cn(
            'text-dark-400 mb-1',
            variant === 'default' ? 'text-sm' : 'text-sm mb-1.5',
          )}>{title}</p>
          <div className="flex items-baseline gap-1">
            <span className={cn(
              'font-bold text-dark-600',
              variant === 'default' ? 'text-3xl' : 'text-2xl xl:text-3xl',
            )}>{value}</span>
            {unit && <span className="text-sm text-dark-400">{unit}</span>}
          </div>
          {trendValue && (
            <div className={cn(
              'flex items-center gap-1 text-xs',
              variant === 'default' ? 'mt-2' : 'mt-2.5 font-medium',
              isTrendPositive ? 'text-danger-600' : 'text-success-600',
            )}>
              {isTrendPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>
                {trendValue}
                {trendLabel ?? defaultTrendLabel}
              </span>
            </div>
          )}
        </div>
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center',
          color,
          variant === 'bordered' && 'shadow-lg',
        )}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </div>
  );
}
