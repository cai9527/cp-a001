import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { cn } from '@/lib/utils';

interface PieDataItem {
  name: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  title?: string;
  subtitle?: string;
  data: PieDataItem[];
  height?: number;
  donut?: boolean;
  className?: string;
  showLegend?: boolean;
}

export default function PieChart({
  title,
  subtitle,
  data,
  height = 300,
  donut = true,
  className,
  showLegend = true,
}: PieChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current);
    }

    const defaultColors = [
      '#00B42A',
      '#FF7D00',
      '#F53F3F',
      '#165DFF',
      '#722ED1',
      '#14C9C9',
      '#F7BA1E',
      '#EB2F96',
    ];

    const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

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
        trigger: 'item',
        backgroundColor: 'rgba(29, 33, 41, 0.95)',
        borderColor: 'rgba(29, 33, 41, 0.95)',
        textStyle: {
          color: '#fff',
          fontSize: 12,
        },
        padding: [10, 14],
        formatter: (params: any) => {
          const percent = ((params.value / total) * 100).toFixed(1);
          return `<div style="font-weight:500;margin-bottom:4px">${params.name}</div>
                  <div>数量: <b>${params.value}</b></div>
                  <div>占比: <b>${percent}%</b></div>`;
        },
      },
      legend: showLegend
        ? {
            orient: 'vertical',
            right: 0,
            top: title ? 'center' : 0,
            itemWidth: 10,
            itemHeight: 10,
            itemGap: 12,
            textStyle: {
              fontSize: 12,
              color: '#4E5969',
            },
            formatter: (name: string) => {
              const item = data.find((d) => d.name === name);
              if (!item) return name;
              const percent = ((item.value / total) * 100).toFixed(1);
              return `${name}  ${percent}%`;
            },
          }
        : undefined,
      series: [
        {
          name: title || '数据分布',
          type: 'pie',
          radius: donut ? ['55%', '75%'] : '75%',
          center: showLegend ? ['38%', '55%'] : ['50%', '55%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: donut
            ? {
                show: true,
                position: 'center',
                formatter: () => {
                  return `{total|${total}}\n{label|总计}`;
                },
                rich: {
                  total: {
                    fontSize: 28,
                    fontWeight: 700,
                    color: '#1D2129',
                    lineHeight: 36,
                  },
                  label: {
                    fontSize: 12,
                    color: '#86909C',
                    lineHeight: 20,
                  },
                },
              }
            : {
                show: true,
                formatter: '{b}\n{d}%',
                color: '#4E5969',
                fontSize: 11,
              },
          emphasis: {
            scale: true,
            scaleSize: 8,
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 600,
            },
            itemStyle: {
              shadowBlur: 20,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.15)',
            },
          },
          labelLine: donut ? { show: false } : { show: true, length: 10, length2: 8 },
          data: data.map((d, idx) => ({
            value: d.value,
            name: d.name,
            itemStyle: {
              color: d.color || defaultColors[idx % defaultColors.length],
            },
          })),
        },
      ],
    };

    chartInstanceRef.current.setOption(option, true);

    const handleResize = () => chartInstanceRef.current?.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [title, subtitle, data, donut, showLegend]);

  return (
    <div
      ref={chartRef}
      style={{ height, width: '100%' }}
      className={cn('w-full', className)}
    />
  );
}
