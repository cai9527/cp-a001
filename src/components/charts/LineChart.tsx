import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { cn } from '@/lib/utils';

interface LineSeries {
  name: string;
  data: Array<{ time: string; value: number }>;
  color?: string;
}

interface LineChartProps {
  title?: string;
  subtitle?: string;
  series: LineSeries[];
  xAxisName?: string;
  yAxisName?: string;
  height?: number;
  smooth?: boolean;
  areaStyle?: boolean;
  className?: string;
}

export default function LineChart({
  title,
  subtitle,
  series,
  xAxisName,
  yAxisName,
  height = 320,
  smooth = true,
  areaStyle = false,
  className,
}: LineChartProps) {
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

    const seriesData = series.map((s, idx) => ({
      name: s.name,
      type: 'line' as const,
      smooth,
      showSymbol: false,
      symbol: 'circle' as const,
      symbolSize: 6,
      lineStyle: {
        width: 2.5,
        color: s.color || defaultColors[idx % defaultColors.length],
      },
      itemStyle: {
        color: s.color || defaultColors[idx % defaultColors.length],
      },
      areaStyle: areaStyle
        ? {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: (s.color || defaultColors[idx % defaultColors.length]) + '30' },
              { offset: 1, color: (s.color || defaultColors[idx % defaultColors.length]) + '03' },
            ]),
          }
        : undefined,
      emphasis: {
        focus: 'series' as const,
        lineStyle: { width: 3.5 },
      },
      data: s.data.map((d) => [d.time, d.value]),
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
        backgroundColor: 'rgba(29, 33, 41, 0.95)',
        borderColor: 'rgba(29, 33, 41, 0.95)',
        borderWidth: 1,
        textStyle: {
          color: '#fff',
          fontSize: 12,
        },
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: '#C9CDD4',
            type: 'dashed',
          },
        },
        padding: [10, 14],
      },
      legend: {
        show: series.length > 1,
        top: title ? 32 : 0,
        right: 0,
        orient: 'horizontal',
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
        right: 24,
        top: title ? (series.length > 1 ? 72 : 56) : series.length > 1 ? 40 : 24,
        bottom: 32,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        name: xAxisName,
        nameLocation: 'end',
        nameTextStyle: {
          fontSize: 11,
          color: '#86909C',
          padding: [16, 0, 0, 0],
        },
        boundaryGap: false,
        axisLine: {
          lineStyle: { color: '#E5E6EB' },
        },
        axisTick: { show: false },
        axisLabel: {
          color: '#86909C',
          fontSize: 11,
          formatter: (value: string) => {
            if (value.length > 10) {
              return value.slice(5, 16);
            }
            return value;
          },
        },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        name: yAxisName,
        nameTextStyle: {
          fontSize: 11,
          color: '#86909C',
        },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#86909C',
          fontSize: 11,
        },
        splitLine: {
          lineStyle: {
            color: '#F2F3F5',
            type: 'dashed',
          },
        },
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
          zoomOnMouseWheel: 'ctrl',
          moveOnMouseMove: true,
        },
      ],
      series: seriesData,
    };

    chartInstanceRef.current.setOption(option, true);

    const handleResize = () => chartInstanceRef.current?.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [title, subtitle, series, xAxisName, yAxisName, smooth, areaStyle]);

  return (
    <div
      ref={chartRef}
      style={{ height, width: '100%' }}
      className={cn('w-full', className)}
    />
  );
}
