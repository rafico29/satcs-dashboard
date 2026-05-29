import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ContratoIntegrado } from '../../types';
import ChartCard, { EmptyChart } from './ChartCard';

interface Props {
  data: ContratoIntegrado[];
}

function colorForScore(score: number): string {
  // Gradient blue → amber → red
  if (score > 0.7) return '#dc2626';
  if (score > 0.55) return '#f97316';
  if (score > 0.4) return '#f59e0b';
  if (score > 0.25) return '#facc15';
  return '#3b82f6';
}

export default function ScoreByDeptChart({ data }: Props) {
  const top = useMemo(() => {
    const acc = new Map<string, { total: number; sum: number }>();
    data.forEach((d) => {
      if (!d.departamento) return;
      const prev = acc.get(d.departamento) ?? { total: 0, sum: 0 };
      prev.total += 1;
      prev.sum += d.scoreCompuesto;
      acc.set(d.departamento, prev);
    });
    return [...acc.entries()]
      .filter(([, v]) => v.total >= 3)
      .map(([nombre, v]) => ({
        departamento: nombre,
        scoreMedio: v.sum / v.total,
        contratos: v.total,
      }))
      .sort((a, b) => b.scoreMedio - a.scoreMedio)
      .slice(0, 15)
      .reverse();
  }, [data]);

  return (
    <ChartCard
      title="Score promedio por departamento"
      subtitle="Top 15 departamentos con mayor riesgo medio (mín. 3 contratos)"
    >
      <div className="h-full w-full">
        {top.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer>
            <BarChart
              data={top}
              layout="vertical"
              margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                type="number"
                domain={[0, 1]}
                tick={{ fontSize: 11, fill: '#475569' }}
              />
              <YAxis
                type="category"
                dataKey="departamento"
                tick={{ fontSize: 11, fill: '#475569' }}
                width={130}
              />
              <Tooltip
                cursor={{ fill: 'rgba(59,130,246,0.08)' }}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                }}
                formatter={(value: number, name) => {
                  if (name === 'scoreMedio')
                    return [value.toFixed(3), 'Score medio'];
                  return [value, name];
                }}
              />
              <Bar dataKey="scoreMedio" radius={[0, 4, 4, 0]}>
                {top.map((row) => (
                  <Cell
                    key={row.departamento}
                    fill={colorForScore(row.scoreMedio)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartCard>
  );
}
