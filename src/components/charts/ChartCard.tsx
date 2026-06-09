import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title?: string;
  subtitle?: string;
  extra?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export default function ChartCard({
  title,
  subtitle,
  extra,
  children,
  className,
  bodyClassName,
}: ChartCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-dark-50 overflow-hidden',
        className,
      )}
    >
      {(title || extra) && (
        <div className="px-6 py-4 border-b border-dark-50 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {title && (
              <h3 className="text-base font-semibold text-dark-600 leading-tight">{title}</h3>
            )}
            {subtitle && (
              <p className="text-xs text-dark-400 mt-1 leading-tight">{subtitle}</p>
            )}
          </div>
          {extra && <div className="flex-shrink-0">{extra}</div>}
        </div>
      )}
      <div className={cn('p-6', bodyClassName)}>{children}</div>
    </div>
  );
}
