import { useMemo } from 'react';
import { FileSearch, AlertTriangle, Flame, PiggyBank } from 'lucide-react';
import type { ContratoIntegrado } from '../types';
import { formatCOP, formatNumber } from '../data/loadData';

interface Props {
  data: ContratoIntegrado[];
}

interface KpiSpec {
  label: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
}

export default function KPIs({ data }: Props) {
  const kpis: KpiSpec[] = useMemo(() => {
    const total = data.length;

    const alertas = data.filter(
      (d) => d.labelConsenso === 1 || d.scoreCompuesto > 0.5,
    ).length;

    const riesgoAlto = data.filter((d) => d.scoreCompuesto > 0.7).length;

    const ahorroPotencial =
      data
        .filter((d) => d.nPipelinesAnomalo >= 1 || d.scoreCompuesto > 0.5)
        .reduce((sum, d) => sum + (Number.isFinite(d.precio) ? d.precio : 0), 0) *
      0.15;

    return [
      {
        label: 'Contratos analizados',
        value: formatNumber(total),
        helper: 'Total filtrado',
        icon: <FileSearch className="h-5 w-5" />,
        color: 'text-accent',
        bg: 'bg-accent/10',
        border: 'border-accent/20',
      },
      {
        label: 'Alertas generadas',
        value: formatNumber(alertas),
        helper: 'Consenso o score > 0.5',
        icon: <AlertTriangle className="h-5 w-5" />,
        color: 'text-amber-600',
        bg: 'bg-amber-100',
        border: 'border-amber-200',
      },
      {
        label: 'Riesgo alto',
        value: formatNumber(riesgoAlto),
        helper: 'Score compuesto > 0.7',
        icon: <Flame className="h-5 w-5" />,
        color: 'text-critical',
        bg: 'bg-red-100',
        border: 'border-red-200',
      },
      {
        label: 'Ahorro potencial',
        value: formatCOP(ahorroPotencial),
        helper: '15 % recuperable estimado',
        icon: <PiggyBank className="h-5 w-5" />,
        color: 'text-emerald-600',
        bg: 'bg-emerald-100',
        border: 'border-emerald-200',
      },
    ];
  }, [data]);

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((k) => (
        <article
          key={k.label}
          className={`rounded-xl border ${k.border} bg-white p-6 shadow-card`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {k.label}
              </p>
              <p className="mt-2 break-words text-2xl font-bold text-slate-900">
                {k.value}
              </p>
              <p className="mt-1 text-xs text-slate-500">{k.helper}</p>
            </div>
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${k.bg} ${k.color}`}
            >
              {k.icon}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
