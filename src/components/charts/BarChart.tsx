import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { cn } from '@/lib/utils';

interface BarSeries {
  name: string;
  data: Array<{ category: string; value: number }>;
  color?: string;
}

interface BarChartProps {
  title?: string;
  subtitle?: string;
  series: BarSeries[];
  xAxisName?: string;
  yAxisName?: string;
  height?: number;
  horizontal?: boolean;
  className?: string;
  showValue?: boolean;
}

export default function BarChart({
  title,
  subtitle,
  series,
  xAxisName,
  yAxisName,
  height = 320,
  horizontal = false,
  className,
  showValue = true,
}: BarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current);
    }

    const defaultColors = [
      '#165DFF',
      '#00B42A',
      '#FF7D00',
      '#F53F3F',
      '#722ED1',
      '#14C9C9',
      '#F7BA1E',
      '#EB2F96',
    ];

    const categories = series[0]?.data.map((d) => d.category) || [];

    const seriesData = series.map((s, idx) => ({
      name: s.name,
      type: 'bar' as const,
      barMaxWidth: 40,
      barGap: '20%',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(
          horizontal ? 0 : 0,
          horizontal ? 0 : 0,
          horizontal ? 1 : 0,
          horizontal ? 0 : 1,
          [
            { offset: 0, color: s.color || defaultColors[idx % defaultColors.length] },
            { offset: 1, color: (s.color || defaultColors[idx % defaultColors.length]) + '80' },
          ],
        ),
        borderRadius: horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0],
      },
      emphasis: {
        itemStyle: {
          color: s.color || defaultColors[idx % defaultColors.length],
        },
      },
      label: showValue
        ? {
            show: true,
            position: horizontal ? ('right' as const) : ('top' as const),
            color: '#4E5969',
            fontSize: 12,
            fontWeight: 500 as const,
          }
        : undefined,
      data: s.data.map((d) => d.value),
    }));

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
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(29, 33, 41, 0.95)',
        borderColor: 'rgba(29, 33, 41, 0.95)',
        textStyle: {
          color: '#fff',
          fontSize: 12,
        },
        padding: [10, 14],
      },
      legend: {
        show: series.length > 1,
        top: title ? 32 : 0,
        right: 0,
        itemWidth: 14,
        itemHeight: 8,
        itemGap: 16,
        textStyle: {
          fontSize: 12,
          color: '#4E5969',
        },
      },
      grid: {
        left: 48,
        right: showValue ? 48 : 24,
        top: title ? (series.length > 1 ? 72 : 56) : series.length > 1 ? 40 : 24,
        bottom: 40,
        containLabel: true,
      },
      xAxis: horizontal
        ? {
            type: 'value',
            name: xAxisName,
            nameTextStyle: { fontSize: 11, color: '#86909C' },
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#86909C', fontSize: 11 },
            splitLine: { lineStyle: { color: '#F2F3F5', type: 'dashed' } },
          }
        : {
            type: 'category',
            name: xAxisName,
            nameTextStyle: { fontSize: 11, color: '#86909C' },
            data: categories,
            axisLine: { lineStyle: { color: '#E5E6EB' } },
            axisTick: { show: false },
            axisLabel: {
              color: '#86909C',
              fontSize: 11,
              interval: 0,
              rotate: categories.length > 6 ? 30 : 0,
            },
          },
      yAxis: horizontal
        ? {
            type: 'category',
            name: yAxisName,
            nameTextStyle: { fontSize: 11, color: '#86909C' },
            data: categories,
            axisLine: { lineStyle: { color: '#E5E6EB' } },
            axisTick: { show: false },
            axisLabel: { color: '#86909C', fontSize: 11 },
          }
        : {
            type: 'value',
            name: yAxisName,
            nameTextStyle: { fontSize: 11, color: '#86909C' },
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#86909C', fontSize: 11 },
            splitLine: { lineStyle: { color: '#F2F3F5', type: 'dashed' } },
          },
      series: seriesData,
    };

    chartInstanceRef.current.setOption(option, true);

    const handleResize = () => chartInstanceRef.current?.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [title, subtitle, series, xAxisName, yAxisName, horizontal, showValue]);

  return (
    <div
      ref={chartRef}
      style={{ height, width: '100%' }}
      className={cn('w-full', className)}
    />
  );
}
