import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ContratoIntegrado } from '../types';

interface Props {
  data: ContratoIntegrado[];
}

const BIN_COUNT = 20;

export default function DistributionChart({ data }: Props) {
  const bins = useMemo(() => {
    const result = Array.from({ length: BIN_COUNT }, (_, i) => ({
      bin: i,
      rangoLabel: `${(i / BIN_COUNT).toFixed(2)}–${((i + 1) / BIN_COUNT).toFixed(2)}`,
      count: 0,
    }));
    data.forEach((d) => {
      const score = Math.max(0, Math.min(0.9999, d.scoreCompuesto));
      const idx = Math.floor(score * BIN_COUNT);
      result[idx].count += 1;
    });
    return result;
  }, [data]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Distribucion de score compuesto
        </h2>
        <div className="hidden gap-3 text-xs text-slate-500 md:flex">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> 0.4 warning
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-600" /> 0.7 critico
          </span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer>
          <BarChart data={bins} margin={{ top: 10, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="rangoLabel"
              interval={1}
              tick={{ fontSize: 10, fill: '#475569' }}
              angle={-25}
              textAnchor="end"
              height={50}
            />
            <YAxis tick={{ fontSize: 11, fill: '#475569' }} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: 'rgba(59,130,246,0.08)' }}
              formatter={(value: number) => [value, 'Contratos']}
              labelFormatter={(label) => `Score: ${label}`}
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: '1px solid #e2e8f0',
              }}
            />
            <ReferenceLine
              x={bins[Math.floor(0.4 * BIN_COUNT)]?.rangoLabel}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              label={{ value: '0.4', position: 'top', fill: '#b45309', fontSize: 11 }}
            />
            <ReferenceLine
              x={bins[Math.floor(0.7 * BIN_COUNT)]?.rangoLabel}
              stroke="#dc2626"
              strokeDasharray="4 4"
              label={{ value: '0.7', position: 'top', fill: '#b91c1c', fontSize: 11 }}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
