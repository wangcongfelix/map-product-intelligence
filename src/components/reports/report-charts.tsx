'use client';

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { MetricDatum, ReportMetrics } from '@/types/report';

const COLORS = ['#2563eb', '#16a34a', '#f97316', '#dc2626', '#7c3aed', '#0891b2'];
const EXPORT_COLORS = ['#2563eb', '#059669', '#ea580c', '#dc2626', '#7c3aed', '#0891b2'];

function fileStamp(): string {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    '-',
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0')
  ].join('');
}

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number
): void {
  const chars = Array.from(text);
  let line = '';
  let lineY = y;

  chars.forEach((char) => {
    const next = `${line}${char}`;
    if (ctx.measureText(next).width > maxWidth && line.length > 0) {
      ctx.fillText(line, x, lineY);
      line = char;
      lineY += 20;
      return;
    }
    line = next;
  });

  if (line) ctx.fillText(line, x, lineY);
}

function drawPanel(
  ctx: CanvasRenderingContext2D,
  title: string,
  data: MetricDatum[],
  x: number,
  y: number,
  width: number,
  height: number,
  type: 'bar' | 'horizontal' | 'pie'
): void {
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#111827';
  ctx.font = '700 24px sans-serif';
  ctx.fillText(title, x + 28, y + 42);

  if (data.length === 0) {
    ctx.fillStyle = '#64748b';
    ctx.font = '400 20px sans-serif';
    ctx.fillText('请先勾选信号', x + 28, y + 96);
    return;
  }

  const max = Math.max(...data.map((item) => item.count), 1);
  const chartX = x + 28;
  const chartY = y + 78;
  const chartWidth = width - 56;
  const chartHeight = height - 112;

  if (type === 'pie') {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    let start = -Math.PI / 2;
    const cx = chartX + 170;
    const cy = chartY + chartHeight / 2;
    const radius = Math.min(132, chartHeight / 2 - 16);

    data.forEach((item, index) => {
      const angle = (item.count / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, start + angle);
      ctx.closePath();
      ctx.fillStyle = EXPORT_COLORS[index % EXPORT_COLORS.length];
      ctx.fill();
      start += angle;
    });

    data.forEach((item, index) => {
      const legendY = chartY + 20 + index * 34;
      ctx.fillStyle = EXPORT_COLORS[index % EXPORT_COLORS.length];
      ctx.fillRect(chartX + 360, legendY - 12, 16, 16);
      ctx.fillStyle = '#334155';
      ctx.font = '400 18px sans-serif';
      drawText(ctx, `${item.name}：${item.count}`, chartX + 386, legendY + 2, chartWidth - 390);
    });
    return;
  }

  data.slice(0, 8).forEach((item, index) => {
    if (type === 'horizontal') {
      const rowY = chartY + index * 34;
      const barX = chartX + 150;
      const barWidth = Math.max(6, ((chartWidth - 190) * item.count) / max);
      ctx.fillStyle = '#475569';
      ctx.font = '400 16px sans-serif';
      drawText(ctx, item.name, chartX, rowY + 18, 136);
      ctx.fillStyle = EXPORT_COLORS[index % EXPORT_COLORS.length];
      ctx.fillRect(barX, rowY + 4, barWidth, 18);
      ctx.fillStyle = '#111827';
      ctx.fillText(String(item.count), barX + barWidth + 8, rowY + 20);
      return;
    }

    const gap = 18;
    const barWidth = (chartWidth - gap * (data.length - 1)) / data.length;
    const barHeight = Math.max(4, (chartHeight - 56) * (item.count / max));
    const barX = chartX + index * (barWidth + gap);
    const barY = chartY + chartHeight - 46 - barHeight;
    ctx.fillStyle = EXPORT_COLORS[index % EXPORT_COLORS.length];
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = '#111827';
    ctx.font = '600 16px sans-serif';
    ctx.fillText(String(item.count), barX + barWidth / 2 - 5, barY - 8);
    ctx.fillStyle = '#475569';
    ctx.font = '400 14px sans-serif';
    drawText(ctx, item.name, barX, chartY + chartHeight - 22, barWidth + 8);
  });
}

export function exportReportChartsPng(metrics: ReportMetrics): void {
  const canvas = document.createElement('canvas');
  const scale = 2;
  const width = 1600;
  const height = 1100;
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.scale(scale, scale);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#0f172a';
  ctx.font = '800 38px sans-serif';
  ctx.fillText('地图产品竞品分析图表总览', 52, 62);
  ctx.fillStyle = '#64748b';
  ctx.font = '400 18px sans-serif';
  ctx.fillText('基于当前勾选的人工确认产品信号生成', 52, 94);

  drawPanel(ctx, '模块分布', metrics.moduleDistribution, 52, 128, 700, 420, 'horizontal');
  drawPanel(ctx, '来源渠道分布', metrics.sourceDistribution, 848, 128, 700, 420, 'pie');
  drawPanel(ctx, '信号类型分布', metrics.signalTypeDistribution, 52, 610, 700, 420, 'bar');
  drawPanel(ctx, '影响程度分布', metrics.impactDistribution, 848, 610, 700, 420, 'bar');

  const link = document.createElement('a');
  link.download = `map-product-intelligence-charts-${fileStamp()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function EmptyChart({ message = '请先勾选信号。' }: { message?: string }) {
  return (
    <div className='text-muted-foreground flex h-56 items-center justify-center rounded-md border border-dashed p-4 text-center text-sm'>
      {message}
    </div>
  );
}

function DistributionBarChart({
  data,
  horizontal = false
}: {
  data: MetricDatum[];
  horizontal?: boolean;
}) {
  if (data.length === 0) return <EmptyChart />;

  if (horizontal) {
    return (
      <ChartContainer config={{ count: { label: '信号数', color: COLORS[0] } }} className='h-72'>
        <BarChart data={data} layout='vertical' margin={{ left: 12, right: 24 }}>
          <CartesianGrid horizontal={false} />
          <XAxis type='number' allowDecimals={false} />
          <YAxis type='category' dataKey='name' width={96} tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey='count' fill='var(--color-count)' radius={4} />
        </BarChart>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer config={{ count: { label: '信号数', color: COLORS[0] } }} className='h-72'>
      <BarChart data={data} margin={{ left: 8, right: 16 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey='name' tickLine={false} axisLine={false} interval={0} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey='count' fill='var(--color-count)' radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

function DistributionPieChart({ data }: { data: MetricDatum[] }) {
  if (data.length === 0) return <EmptyChart />;

  return (
    <ChartContainer config={{ count: { label: '信号数' } }} className='h-72'>
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey='name' />} />
        <Pie data={data} dataKey='count' nameKey='name' outerRadius={92} label>
          {data.map((item, index) => (
            <Cell key={item.name} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}

export function ReportCharts({ metrics }: { metrics: ReportMetrics }) {
  return (
    <section className='grid min-w-0 gap-4 xl:grid-cols-2'>
      <Card className='min-w-0 overflow-hidden'>
        <CardHeader>
          <CardTitle className='text-base'>模块分布图</CardTitle>
          <CardDescription>按已勾选信号的产品模块统计。</CardDescription>
        </CardHeader>
        <CardContent className='min-w-0'>
          <DistributionBarChart data={metrics.moduleDistribution} horizontal />
        </CardContent>
      </Card>
      <Card className='min-w-0 overflow-hidden'>
        <CardHeader>
          <CardTitle className='text-base'>来源渠道分布图</CardTitle>
          <CardDescription>看本期选中信号主要来自哪些资料来源。</CardDescription>
        </CardHeader>
        <CardContent className='min-w-0'>
          <DistributionPieChart data={metrics.sourceDistribution} />
        </CardContent>
      </Card>
      <Card className='min-w-0 overflow-hidden'>
        <CardHeader>
          <CardTitle className='text-base'>信号类型分布图</CardTitle>
          <CardDescription>区分功能故障、入口难找、功能建议等类型。</CardDescription>
        </CardHeader>
        <CardContent className='min-w-0'>
          <DistributionBarChart data={metrics.signalTypeDistribution} />
        </CardContent>
      </Card>
      <Card className='min-w-0 overflow-hidden'>
        <CardHeader>
          <CardTitle className='text-base'>影响程度分布图</CardTitle>
          <CardDescription>用于周报、月报中呈现高 / 中 / 低影响数量。</CardDescription>
        </CardHeader>
        <CardContent className='min-w-0'>
          <DistributionBarChart data={metrics.impactDistribution} />
        </CardContent>
      </Card>
    </section>
  );
}
