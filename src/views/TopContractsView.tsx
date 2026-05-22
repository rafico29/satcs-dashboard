import { Fragment, useMemo, useState } from 'react';
import {
  Trophy,
  Building2,
  MapPin,
  Layers,
  ChevronRight,
  Download,
} from 'lucide-react';
import type { ContratoTop15 } from '../types';
import { formatCOP, formatNumber } from '../data/loadData';

interface Props {
  top15: ContratoTop15[];
}

function ScorePill({ score }: { score: number }) {
  const className =
    score > 0.7
      ? 'bg-red-100 text-red-700 ring-1 ring-red-200'
      : score >= 0.4
        ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
        : 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      <span className="font-mono tabular-nums">{score.toFixed(3)}</span>
    </span>
  );
}

function MiniBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
        <span>{label}</span>
        <span className="font-mono tabular-nums">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function downloadCsv(rows: ContratoTop15[]) {
  const headers = [
    'Caso #',
    'ID Proceso SECOP',
    'Entidad Contratante',
    'Departamento',
    'Tipo de Contrato',
    'Valor del Contrato (COP)',
    'Duracion (dias)',
    'Proveedor',
    'Score de Riesgo (0-1)',
    'Analisis que lo detectan (de 3)',
    'Analisis A (%)',
    'Analisis B (%)',
    'Analisis C (%)',
  ];
  const escape = (val: unknown) => {
    const s = String(val ?? '');
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [
    headers.join(','),
    ...rows.map((r) =>
      [
        r.caso,
        r.idProceso,
        r.entidad,
        r.departamento,
        r.tipoContrato,
        r.valor,
        r.duracion,
        r.proveedor,
        r.scoreRiesgo,
        r.analisisDetectan,
        r.analisisA,
        r.analisisB,
        r.analisisC,
      ]
        .map(escape)
        .join(','),
    ),
  ];
  const blob = new Blob(['\ufeff' + lines.join('\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'satcs_top15.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function TopContractsView({ top15 }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null);

  const stats = useMemo(() => {
    const valorTotal = top15.reduce((s, r) => s + (r.valor || 0), 0);
    const departamentos = new Set(top15.map((r) => r.departamento));
    return {
      total: top15.length,
      valorTotal,
      departamentos: departamentos.size,
    };
  }, [top15]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Top contratos
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Top {stats.total} contratos con mayor riesgo
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Casos prioritarios de revisión, ordenados por score compuesto.
          </p>
        </div>
        <button
          type="button"
          onClick={() => downloadCsv(top15)}
          disabled={top15.length === 0}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </button>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Casos prioritarios
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {stats.total}
              </p>
            </div>
          </div>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Valor comprometido
              </p>
              <p className="mt-1 break-words text-2xl font-bold text-slate-900">
                {formatCOP(stats.valorTotal)}
              </p>
            </div>
          </div>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Departamentos cubiertos
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {stats.departamentos}
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-0 shadow-card">
        <div className="scroll-thin overflow-x-auto rounded-xl">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-3 py-3 text-left">#</th>
                <th className="px-3 py-3 text-left">ID</th>
                <th className="px-3 py-3 text-left">Entidad</th>
                <th className="px-3 py-3 text-left">Depto</th>
                <th className="px-3 py-3 text-left">Tipo</th>
                <th className="px-3 py-3 text-right">Valor</th>
                <th className="px-3 py-3 text-right">Duración</th>
                <th className="px-3 py-3 text-left">Proveedor</th>
                <th className="px-3 py-3 text-right">Score</th>
                <th className="px-3 py-3 text-right">Detectado por</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {top15.length === 0 && (
                <tr>
                  <td
                    colSpan={11}
                    className="px-3 py-12 text-center text-sm text-slate-400"
                  >
                    No hay datos de top contratos disponibles.
                  </td>
                </tr>
              )}
              {top15.map((row) => {
                const isOpen = expanded === row.caso;
                return (
                  <Fragment key={row.caso}>
                    <tr
                      onClick={() =>
                        setExpanded((prev) =>
                          prev === row.caso ? null : row.caso,
                        )
                      }
                      className={`cursor-pointer transition ${
                        isOpen ? 'bg-accent/5' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-3 py-2.5 font-bold text-slate-700">
                        {row.caso}
                      </td>
                      <td className="max-w-[120px] truncate px-3 py-2.5 font-mono text-[11px] text-slate-500">
                        {row.idProceso}
                      </td>
                      <td
                        className="max-w-[220px] truncate px-3 py-2.5 text-slate-700"
                        title={row.entidad}
                      >
                        <Building2 className="mr-1 inline h-3 w-3 text-slate-400" />
                        {row.entidad}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">
                        {row.departamento}
                      </td>
                      <td
                        className="max-w-[160px] truncate px-3 py-2.5 text-slate-600"
                        title={row.tipoContrato}
                      >
                        {row.tipoContrato}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-slate-700">
                        {formatCOP(row.valor)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-slate-700">
                        {formatNumber(row.duracion)} d
                      </td>
                      <td
                        className="max-w-[180px] truncate px-3 py-2.5 text-slate-600"
                        title={row.proveedor}
                      >
                        {row.proveedor}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right">
                        <ScorePill score={row.scoreRiesgo} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono tabular-nums text-slate-700">
                        {row.analisisDetectan}/3
                      </td>
                      <td className="px-3 py-2.5">
                        <ChevronRight
                          className={`h-4 w-4 text-slate-400 transition-transform ${
                            isOpen ? 'rotate-90' : ''
                          }`}
                        />
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="bg-slate-50/60">
                        <td colSpan={11} className="px-6 py-4">
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <MiniBar
                              label="Análisis A (Estadístico)"
                              value={row.analisisA}
                              color="bg-accent"
                            />
                            <MiniBar
                              label="Análisis B (No supervisado)"
                              value={row.analisisB}
                              color="bg-amber-500"
                            />
                            <MiniBar
                              label="Análisis C (Supervisado)"
                              value={row.analisisC}
                              color="bg-red-500"
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
