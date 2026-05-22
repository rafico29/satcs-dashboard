import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
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

const COLORS: Record<number, string> = {
  0: '#94a3b8',
  1: '#facc15',
  2: '#f59e0b',
  3: '#f97316',
  4: '#dc2626',
};

const LABELS: Record<number, string> = {
  0: 'Ningún modelo',
  1: '1 modelo',
  2: '2 modelos',
  3: '3 modelos',
  4: '4 modelos',
};

export default function ModelAgreementChart({ data }: Props) {
  const counts = useMemo(() => {
    const acc: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    data.forEach((d) => {
      const n = Math.min(4, Math.max(0, d.nPipelinesAnomalo));
      acc[n] = (acc[n] ?? 0) + 1;
    });
    return [0, 1, 2, 3, 4].map((k) => ({
      nivel: LABELS[k],
      key: k,
      contratos: acc[k] ?? 0,
    }));
  }, [data]);

  const total = counts.reduce((s, c) => s + c.contratos, 0);

  return (
    <ChartCard
      title="Consenso entre modelos"
      subtitle="Cuántos pipelines marcaron como anómalo cada contrato"
    >
      <div className="h-[320px] w-full">
        {total === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer>
            <BarChart
              data={counts}
              margin={{ top: 24, right: 16, left: 0, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="nivel"
                tick={{ fontSize: 11, fill: '#475569' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#475569' }}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(59,130,246,0.08)' }}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                }}
                formatter={(value: number) => [
                  `${value} (${((value / total) * 100).toFixed(1)}%)`,
                  'Contratos',
                ]}
              />
              <Bar dataKey="contratos" radius={[4, 4, 0, 0]}>
                <LabelList
                  dataKey="contratos"
                  position="top"
                  style={{ fontSize: 11, fill: '#334155' }}
                />
                {counts.map((row) => (
                  <Cell key={row.key} fill={COLORS[row.key] ?? '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartCard>
  );
}
