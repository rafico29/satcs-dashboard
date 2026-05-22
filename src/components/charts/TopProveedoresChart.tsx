import { useMemo } from 'react';
import {
  Bar,
  BarChart,
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

function shorten(name: string, max = 38): string {
  if (name.length <= max) return name;
  return `${name.slice(0, max - 1)}…`;
}

export default function TopProveedoresChart({ data }: Props) {
  const top = useMemo(() => {
    const acc = new Map<string, number>();
    data.forEach((d) => {
      if (d.labelConsenso === 1 || d.scoreCompuesto > 0.5) {
        if (!d.proveedor) return;
        acc.set(d.proveedor, (acc.get(d.proveedor) ?? 0) + 1);
      }
    });
    return [...acc.entries()]
      .map(([proveedor, alertas]) => ({
        proveedor: shorten(proveedor),
        alertas,
      }))
      .sort((a, b) => b.alertas - a.alertas)
      .slice(0, 10)
      .reverse();
  }, [data]);

  return (
    <ChartCard
      title="Proveedores con más alertas"
      subtitle="Top 10 proveedores adjudicados con mayor número de alertas"
    >
      <div className="h-[420px] w-full">
        {top.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer>
            <BarChart
              data={top}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#475569' }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="proveedor"
                tick={{ fontSize: 10, fill: '#475569' }}
                width={220}
              />
              <Tooltip
                cursor={{ fill: 'rgba(59,130,246,0.08)' }}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                }}
              />
              <Bar dataKey="alertas" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartCard>
  );
}
