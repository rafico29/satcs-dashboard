import { useMemo } from 'react';
import {
  X,
  Building2,
  MapPin,
  FileText,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Activity,
} from 'lucide-react';
import type { ContratoIntegrado } from '../types';
import { formatCOP, formatNumber } from '../data/loadData';

interface Props {
  contrato: ContratoIntegrado | null;
  baseline: ContratoIntegrado[];
  onClose: () => void;
}

interface ModeloRow {
  nombre: string;
  detectado: boolean;
  score?: number;
}

function Semaforo({ status }: { status: 'critical' | 'warning' | 'ok' }) {
  const color =
    status === 'critical'
      ? 'bg-red-500'
      : status === 'warning'
        ? 'bg-amber-500'
        : 'bg-emerald-500';
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />;
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function percentile(value: number, dataset: number[]): number {
  if (dataset.length === 0) return 0;
  const sorted = [...dataset].sort((a, b) => a - b);
  let count = 0;
  for (const v of sorted) {
    if (v <= value) count++;
    else break;
  }
  return Math.round((count / sorted.length) * 100);
}

export default function ExplanationPanel({ contrato, baseline, onClose }: Props) {
  const stats = useMemo(() => {
    if (!contrato) return null;
    const precios = baseline.map((b) => b.precioPorDia).filter(Number.isFinite);
    const duraciones = baseline.map((b) => b.duracionDias).filter(Number.isFinite);
    const medPrecioDia = median(precios);
    const percDuracion = percentile(contrato.duracionDias, duraciones);
    return { medPrecioDia, percDuracion, maxPrecioDia: Math.max(...precios, 1) };
  }, [contrato, baseline]);

  if (!contrato) return null;

  const modelos: ModeloRow[] = [
    {
      nombre: 'Isolation Forest',
      detectado: contrato.iforestAnomalia === 1,
    },
    {
      nombre: 'LOF (Local Outlier Factor)',
      detectado: contrato.lofAnomalia === 1,
    },
    {
      nombre: 'MLP (Red Neuronal)',
      detectado: contrato.mlpAnomalia === 1,
      score: contrato.mlpProbAnomalia,
    },
    {
      nombre: 'Modelo V2 (consenso)',
      detectado: contrato.anomaliaV2 === 1,
      score: contrato.probAnomaliaV2,
    },
  ];

  const detectados = modelos.filter((m) => m.detectado).length;

  let recomendacion = '';
  if (contrato.scoreCompuesto > 0.7 || detectados >= 3) {
    recomendacion =
      'Auditoria PRIORITARIA. Se recomienda revisar de inmediato la documentacion del proceso, los soportes del valor adjudicado y la trayectoria del proveedor. Considere abrir investigacion preliminar.';
  } else if (contrato.scoreCompuesto > 0.4 || detectados >= 1) {
    recomendacion =
      'Revisar como caso de seguimiento. Las anomalias detectadas justifican una verificacion documental y entrevista al supervisor del contrato.';
  } else {
    recomendacion =
      'Sin senales relevantes de riesgo. Mantener en monitoreo rutinario.';
  }

  const scoreStatus: 'critical' | 'warning' | 'ok' =
    contrato.scoreCompuesto > 0.7
      ? 'critical'
      : contrato.scoreCompuesto > 0.4
        ? 'warning'
        : 'ok';

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar panel"
        className="flex-1 bg-slate-900/40 backdrop-blur-sm"
      />
      {/* Drawer */}
      <aside className="scroll-thin flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white p-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Detalle de contrato
            </p>
            <h3 className="mt-1 max-w-md text-base font-bold text-slate-900">
              {contrato.entidad}
            </h3>
            <p className="mt-1 font-mono text-xs text-slate-500">
              {contrato.idProceso}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-5 p-5">
          {/* Score grande */}
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <Semaforo status={scoreStatus} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Score compuesto
                </p>
                <p className="text-2xl font-bold tabular-nums text-slate-900">
                  {contrato.scoreCompuesto.toFixed(3)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Modelos en alerta
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {detectados}
                <span className="text-base text-slate-400"> / 4</span>
              </p>
            </div>
          </div>

          {/* Info general */}
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Informacion general
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2 text-slate-700">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>
                  <strong>Proveedor:</strong> {contrato.proveedor || 'N/D'}
                </span>
              </li>
              <li className="flex items-start gap-2 text-slate-700">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>
                  <strong>Ubicacion:</strong> {contrato.ciudad}, {contrato.departamento}
                </span>
              </li>
              <li className="flex items-start gap-2 text-slate-700">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>
                  <strong>Tipo:</strong> {contrato.tipoContrato}
                </span>
              </li>
              <li className="flex items-start gap-2 text-slate-700">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>
                  <strong>Duracion:</strong> {formatNumber(contrato.duracionDias)} dias
                </span>
              </li>
              <li className="flex items-start gap-2 text-slate-700">
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>
                  <strong>Valor:</strong> {formatCOP(contrato.precio)}
                </span>
              </li>
            </ul>
            {contrato.descripcion && (
              <p className="mt-3 rounded bg-slate-50 p-3 text-xs text-slate-600">
                <strong>Descripción:</strong> {contrato.descripcion}
              </p>
            )}
          </section>

          {/* Factores - Modelos */}
          <section>
            <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              Factores que generan la alerta
            </h4>
            <div className="space-y-2">
              {modelos.map((m) => (
                <div
                  key={m.nombre}
                  className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm ${
                    m.detectado
                      ? 'border-red-200 bg-red-50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Semaforo status={m.detectado ? 'critical' : 'ok'} />
                    <span className="font-medium text-slate-700">{m.nombre}</span>
                  </div>
                  <div className="text-right">
                    {typeof m.score === 'number' && m.score > 0 ? (
                      <span className="font-mono text-xs text-slate-600">
                        prob: {m.score.toFixed(3)}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">
                        {m.detectado ? 'detectado' : 'normal'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Métricas relativas */}
          <section>
            <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <Activity className="h-3.5 w-3.5 text-accent" />
              Metricas relativas
            </h4>

            <div className="space-y-4 text-sm">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-slate-700">Precio / dia</span>
                  <span className="tabular-nums text-slate-600">
                    {formatCOP(contrato.precioPorDia)}{' '}
                    <span className="text-xs text-slate-400">
                      (mediana {formatCOP(stats?.medPrecioDia ?? 0)})
                    </span>
                  </span>
                </div>
                <Bar
                  value={contrato.precioPorDia}
                  max={stats?.maxPrecioDia ?? 1}
                  color={
                    contrato.precioPorDia > (stats?.medPrecioDia ?? 0) * 2
                      ? 'bg-red-500'
                      : 'bg-accent'
                  }
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-slate-700">Duracion (percentil)</span>
                  <span className="tabular-nums text-slate-600">
                    P{stats?.percDuracion ?? 0} • {formatNumber(contrato.duracionDias)} dias
                  </span>
                </div>
                <Bar
                  value={stats?.percDuracion ?? 0}
                  max={100}
                  color="bg-indigo-500"
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-slate-700">ITA del proveedor</span>
                  <span className="tabular-nums text-slate-600">
                    {contrato.ita.toFixed(2)}
                  </span>
                </div>
                <Bar value={contrato.ita} max={100} color="bg-emerald-500" />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-slate-700">IDF del proveedor</span>
                  <span className="tabular-nums text-slate-600">
                    {contrato.idf.toFixed(2)}
                  </span>
                </div>
                <Bar value={contrato.idf} max={100} color="bg-cyan-500" />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-slate-700">Riesgo fiscal del depto.</span>
                  <span className="tabular-nums text-slate-600">
                    {contrato.riesgoFiscal.toFixed(2)}
                  </span>
                </div>
                <Bar
                  value={contrato.riesgoFiscal}
                  max={100}
                  color={
                    contrato.riesgoFiscal > 60 ? 'bg-red-500' : 'bg-amber-500'
                  }
                />
              </div>
            </div>
          </section>

          {/* Recomendación */}
          <section
            className={`rounded-lg border p-4 ${
              scoreStatus === 'critical'
                ? 'border-red-200 bg-red-50'
                : scoreStatus === 'warning'
                  ? 'border-amber-200 bg-amber-50'
                  : 'border-emerald-200 bg-emerald-50'
            }`}
          >
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
              Recomendacion al auditor
            </h4>
            <p className="text-sm leading-relaxed text-slate-700">
              {recomendacion}
            </p>
          </section>
        </div>
      </aside>
    </div>
  );
}
