import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
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

const MESES = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return h;
}

export default function TimelineChart({ data }: Props) {
  const monthly = useMemo(() => {
    const buckets = MESES.map((mes, i) => ({
      mes,
      i,
      alertas: 0,
      contratos: 0,
    }));
    data.forEach((d) => {
      const idx = hashId(d.idProceso) % 12;
      buckets[idx].contratos += 1;
      if (d.labelConsenso === 1 || d.scoreCompuesto > 0.5) {
        buckets[idx].alertas += 1;
      }
    });
    return buckets;
  }, [data]);

  const total = monthly.reduce((s, m) => s + m.alertas, 0);

  return (
    <ChartCard
      title="Línea temporal de alertas"
      subtitle="Distribución por mes (simulación a partir del ID de proceso)"
    >
      <div className="h-[320px] w-full">
        {total === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer>
            <AreaChart
              data={monthly}
              margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
            >
              <defs>
                <linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#dc2626" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="mes"
                tick={{ fontSize: 11, fill: '#475569' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#475569' }}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ stroke: '#dc2626', strokeWidth: 1 }}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                }}
              />
              <Area
                type="monotone"
                dataKey="alertas"
                stroke="#dc2626"
                strokeWidth={2}
                fill="url(#alertGrad)"
                dot={{ r: 3, fill: '#dc2626' }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartCard>
  );
}
