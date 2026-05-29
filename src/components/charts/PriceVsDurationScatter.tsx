import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import type { ContratoIntegrado } from '../../types';
import { formatCOP, formatNumber } from '../../data/loadData';
import ChartCard, { EmptyChart } from './ChartCard';

interface Props {
  data: ContratoIntegrado[];
}

interface Point {
  x: number;
  y: number;
  score: number;
  idProceso: string;
  entidad: string;
  precio: number;
}

const MAX_POINTS = 1500;

function colorForScore(score: number): string {
  if (score > 0.7) return '#dc2626';
  if (score > 0.5) return '#f97316';
  if (score > 0.3) return '#f59e0b';
  return '#3b82f6';
}

export default function PriceVsDurationScatter({ data }: Props) {
  const [active, setActive] = useState<Point | null>(null);

  const points: Point[] = useMemo(() => {
    const all: Point[] = [];
    for (const d of data) {
      if (!Number.isFinite(d.precio) || d.precio <= 0) continue;
      if (!Number.isFinite(d.duracionDias) || d.duracionDias <= 0) continue;
      all.push({
        x: Math.log10(d.precio),
        y: d.duracionDias,
        score: d.scoreCompuesto,
        idProceso: d.idProceso,
        entidad: d.entidad,
        precio: d.precio,
      });
    }
    if (all.length <= MAX_POINTS) return all;
    // Down-sample deterministically while preserving high-score outliers
    const high = all.filter((p) => p.score > 0.5);
    const low = all.filter((p) => p.score <= 0.5);
    const step = Math.ceil(low.length / Math.max(1, MAX_POINTS - high.length));
    const sampled = low.filter((_, i) => i % step === 0);
    return [...sampled, ...high];
  }, [data]);

  return (
    <ChartCard
      title="Precio vs Duración"
      subtitle="Cada punto es un contrato; color por score compuesto (log COP)"
      action={
        active && (
          <button
            onClick={() => setActive(null)}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-500 hover:bg-slate-50"
          >
            Limpiar selección
          </button>
        )
      }
    >
      <div className="h-full w-full">
        {points.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                type="number"
                dataKey="x"
                name="log Precio"
                tick={{ fontSize: 11, fill: '#475569' }}
                tickFormatter={(v) =>
                  `$${formatNumber(Math.pow(10, v) / 1_000_000)}M`
                }
                domain={['auto', 'auto']}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Duración (días)"
                tick={{ fontSize: 11, fill: '#475569' }}
                domain={['auto', 'auto']}
              />
              <ZAxis range={[20, 80]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                }}
                formatter={(_value, _name, item) => {
                  const p = item.payload as Point;
                  return [
                    `${formatCOP(p.precio)} · ${p.y} días · score ${p.score.toFixed(2)}`,
                    p.entidad,
                  ];
                }}
                labelFormatter={() => ''}
              />
              <Scatter
                data={points}
                onClick={(p) => setActive(p as unknown as Point)}
                fill="#3b82f6"
                shape={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (
                    typeof cx !== 'number' ||
                    typeof cy !== 'number' ||
                    !payload
                  )
                    return <></>;
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={payload.score > 0.5 ? 5 : 3}
                      fill={colorForScore(payload.score)}
                      fillOpacity={payload.score > 0.5 ? 0.85 : 0.45}
                      stroke="white"
                      strokeWidth={0.5}
                    />
                  );
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>
      {active && (
        <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <p className="font-semibold text-slate-800">{active.entidad}</p>
          <p className="font-mono text-[10px] text-slate-500">
            {active.idProceso}
          </p>
          <p>
            {formatCOP(active.precio)} · {active.y} días · score{' '}
            {active.score.toFixed(3)}
          </p>
        </div>
      )}
    </ChartCard>
  );
}
