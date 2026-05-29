import { useMemo } from 'react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { ContratoIntegrado } from '../../types';
import ChartCard, { EmptyChart } from './ChartCard';

interface Props {
  data: ContratoIntegrado[];
}

const PALETTE = [
  '#3b82f6',
  '#dc2626',
  '#f59e0b',
  '#10b981',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#94a3b8',
];

export default function ContractTypeChart({ data }: Props) {
  const chartData = useMemo(() => {
    const totalAlertas = data.filter(
      (d) => d.labelConsenso === 1 || d.scoreCompuesto > 0.5,
    );
    const acc = new Map<string, number>();
    totalAlertas.forEach((d) => {
      const key = d.tipoContrato || 'Sin clasificar';
      acc.set(key, (acc.get(key) ?? 0) + 1);
    });
    const entries = [...acc.entries()].sort((a, b) => b[1] - a[1]);
    const top = entries.slice(0, 7);
    const otros = entries.slice(7).reduce((s, [, v]) => s + v, 0);
    if (otros > 0) top.push(['Otros', otros]);
    return top.map(([name, value]) => ({ name, value }));
  }, [data]);

  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <ChartCard
      title="Tipos de contrato en alerta"
      subtitle="Proporción de alertas por modalidad contractual"
    >
      <div className="h-full w-full">
        {total === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer>
            <PieChart>
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                }}
                formatter={(value: number, name) => [
                  `${value} (${((value / total) * 100).toFixed(1)}%)`,
                  name,
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                layout="vertical"
                align="right"
                verticalAlign="middle"
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius="45%"
                outerRadius="80%"
                paddingAngle={2}
                label={({ percent }: { percent?: number }) =>
                  percent && percent > 0.05
                    ? `${(percent * 100).toFixed(0)}%`
                    : ''
                }
                labelLine={false}
              >
                {chartData.map((_, idx) => (
                  <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartCard>
  );
}
