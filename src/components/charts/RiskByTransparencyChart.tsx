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

const NIVELES = ['BAJA', 'MEDIA', 'ALTA'] as const;

const COLORS: Record<string, string> = {
  BAJA: '#dc2626',
  MEDIA: '#f59e0b',
  ALTA: '#10b981',
};

export default function RiskByTransparencyChart({ data }: Props) {
  const grouped = useMemo(() => {
    const acc: Record<string, { sum: number; total: number }> = {
      BAJA: { sum: 0, total: 0 },
      MEDIA: { sum: 0, total: 0 },
      ALTA: { sum: 0, total: 0 },
    };
    data.forEach((d) => {
      const nivel = (d.nivelTransparencia || '').toUpperCase();
      if (acc[nivel]) {
        acc[nivel].sum += d.scoreCompuesto;
        acc[nivel].total += 1;
      }
    });
    return NIVELES.map((nivel) => ({
      nivel,
      scoreMedio:
        acc[nivel].total > 0 ? acc[nivel].sum / acc[nivel].total : 0,
      contratos: acc[nivel].total,
    }));
  }, [data]);

  const hasData = grouped.some((g) => g.contratos > 0);

  return (
    <ChartCard
      title="Score por nivel de transparencia"
      subtitle="Score medio según el indicador de transparencia del territorio"
    >
      <div className="h-full w-full">
        {!hasData ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer>
            <BarChart
              data={grouped}
              margin={{ top: 24, right: 16, left: 0, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="nivel"
                tick={{ fontSize: 11, fill: '#475569' }}
              />
              <YAxis
                domain={[0, 1]}
                tick={{ fontSize: 11, fill: '#475569' }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(59,130,246,0.08)' }}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                }}
                formatter={(value: number, _name, item) => {
                  const payload = item.payload as {
                    contratos: number;
                  };
                  return [
                    `${value.toFixed(3)} (${payload.contratos} contratos)`,
                    'Score medio',
                  ];
                }}
              />
              <Bar dataKey="scoreMedio" radius={[4, 4, 0, 0]}>
                <LabelList
                  dataKey="scoreMedio"
                  position="top"
                  formatter={(v: number) => v.toFixed(2)}
                  style={{ fontSize: 11, fill: '#334155' }}
                />
                {grouped.map((row) => (
                  <Cell key={row.nivel} fill={COLORS[row.nivel] ?? '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartCard>
  );
}
