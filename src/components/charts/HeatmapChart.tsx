import { useEffect, useRef, useMemo } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { cn } from '@/lib/utils';

interface HeatmapChartProps {
  title?: string;
  subtitle?: string;
  deviceNames: string[];
  timestamps: string[];
  data: Array<{ x: number; y: number; value: number }>;
  minValue?: number;
  maxValue?: number;
  height?: number;
  className?: string;
  unit?: string;
}

export default function HeatmapChart({
  title,
  subtitle,
  deviceNames,
  timestamps,
  data,
  minValue = 0,
  maxValue = 200,
  height = 360,
  className,
  unit = 'μg/m³',
}: HeatmapChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  const formattedTimestamps = useMemo(() => {
    return timestamps.map((ts) => {
      const date = new Date(ts);
      const h = String(date.getHours()).padStart(2, '0');
      const m = String(date.getMinutes()).padStart(2, '0');
      return `${h}:${m}`;
    });
  }, [timestamps]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current);
    }

    const option: EChartsOption = {
      title: title
        ? {
            text: title,
            subtext: subtitle,
            left: 0,
            top: 0,
            textStyle: {
              fontSize: 15,
              fontWeight: 600,
              color: '#1D2129',
            },
            subtextStyle: {
              fontSize: 12,
              color: '#86909C',
            },
          }
        : undefined,
      tooltip: {
        position: 'top',
        backgroundColor: 'rgba(29, 33, 41, 0.95)',
        borderColor: 'rgba(29, 33, 41, 0.95)',
        textStyle: {
          color: '#fff',
          fontSize: 12,
        },
        padding: [10, 14],
        formatter: (params: any) => {
          const device = deviceNames[params.value[1]];
          const time = timestamps[params.value[0]];
          const timeStr = new Date(time).toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          });
          return `<div style="font-weight:500;margin-bottom:4px">${device}</div>
                  <div>${timeStr}</div>
                  <div>数值: <b>${params.value[2]} ${unit}</b></div>`;
        },
      },
      grid: {
        left: 100,
        right: 60,
        top: title ? 60 : 24,
        bottom: 60,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: formattedTimestamps,
        splitArea: { show: false },
        axisLine: { lineStyle: { color: '#E5E6EB' } },
        axisTick: { show: false },
        axisLabel: {
          color: '#86909C',
          fontSize: 10,
          interval: Math.floor(formattedTimestamps.length / 10),
          rotate: 0,
        },
      },
      yAxis: {
        type: 'category',
        data: deviceNames,
        splitArea: { show: false },
        axisLine: { lineStyle: { color: '#E5E6EB' } },
        axisTick: { show: false },
        axisLabel: {
          color: '#4E5969',
          fontSize: 11,
          formatter: (value: string) => {
            if (value.length > 8) {
              return value.slice(0, 8) + '...';
            }
            return value;
          },
        },
      },
      visualMap: {
        min: minValue,
        max: maxValue,
        calculable: true,
        orient: 'vertical',
        right: 0,
        top: title ? 60 : 24,
        itemWidth: 12,
        itemHeight: 140,
        textStyle: {
          color: '#86909C',
          fontSize: 10,
        },
        inRange: {
          color: ['#E8F3FF', '#5CA2FF', '#165DFF', '#0E42D2', '#0A2BA3'],
        },
      },
      series: [
        {
          name: title || '热力图',
          type: 'heatmap' as const,
          data: data.map((d) => [d.x, d.y, d.value] as [number, number, number]),
          label: { show: false },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.3)',
            },
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1,
          },
        },
      ],
    };

    chartInstanceRef.current.setOption(option, true);

    const handleResize = () => chartInstanceRef.current?.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [title, subtitle, deviceNames, timestamps, formattedTimestamps, data, minValue, maxValue, unit]);

  return (
    <div
      ref={chartRef}
      style={{ height, width: '100%' }}
      className={cn('w-full', className)}
    />
  );
}
