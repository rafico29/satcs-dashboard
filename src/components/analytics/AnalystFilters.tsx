import { Sliders, X, RotateCcw } from 'lucide-react';
import { useMemo } from 'react';
import type { ContratoIntegrado } from '../../types';

export interface AnalystFilterState {
  scoreMin: number;
  scoreMax: number;
  minDetectores: number;
  precioMin: number;
  precioMax: number;
  duracionMin: number;
  duracionMax: number;
}

export const DEFAULT_ANALYST_FILTERS: AnalystFilterState = {
  scoreMin: 0,
  scoreMax: 1,
  minDetectores: 0,
  precioMin: 0,
  precioMax: Number.POSITIVE_INFINITY,
  duracionMin: 0,
  duracionMax: Number.POSITIVE_INFINITY,
};

interface Props {
  open: boolean;
  filters: AnalystFilterState;
  onChange: (filters: AnalystFilterState) => void;
  onClose: () => void;
  onReset: () => void;
  data: ContratoIntegrado[];
}

const SLIDER_CLASS =
  'h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-accent';

function formatCOPCompact(value: number): string {
  if (!Number.isFinite(value)) return '∞';
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${Math.round(value)}`;
}

export default function AnalystFilters({
  open,
  filters,
  onChange,
  onClose,
  onReset,
  data,
}: Props) {
  const stats = useMemo(() => {
    if (data.length === 0) {
      return { precioMax: 1e10, duracionMax: 365, count: 0 };
    }
    let pMax = 0;
    let dMax = 0;
    data.forEach((d) => {
      if (d.precio > pMax) pMax = d.precio;
      if (d.duracionDias > dMax) dMax = d.duracionDias;
    });
    return { precioMax: pMax, duracionMax: dMax, count: data.length };
  }, [data]);

  const actualPrecioMax = Number.isFinite(filters.precioMax)
    ? filters.precioMax
    : stats.precioMax;
  const actualDuracionMax = Number.isFinite(filters.duracionMax)
    ? filters.duracionMax
    : stats.duracionMax;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex">
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar filtros"
        className="flex-1 bg-slate-900/30 backdrop-blur-sm"
      />
      <aside className="scroll-thin flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-accent" />
            <h3 className="text-base font-bold text-slate-900">
              Filtros del analista
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex flex-col gap-6 p-5">
          {/* Score compuesto */}
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Score compuesto
            </h4>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Min: {filters.scoreMin.toFixed(2)}</span>
              <span>Max: {filters.scoreMax.toFixed(2)}</span>
            </div>
            <div className="space-y-2">
              <input
                type="range"
                className={SLIDER_CLASS}
                min={0}
                max={1}
                step={0.05}
                value={filters.scoreMin}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    scoreMin: Math.min(parseFloat(e.target.value), filters.scoreMax),
                  })
                }
              />
              <input
                type="range"
                className={SLIDER_CLASS}
                min={0}
                max={1}
                step={0.05}
                value={filters.scoreMax}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    scoreMax: Math.max(parseFloat(e.target.value), filters.scoreMin),
                  })
                }
              />
            </div>
          </section>

          {/* Mínimo de detectores */}
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Mínimo de modelos en alerta
            </h4>
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  onClick={() => onChange({ ...filters, minDetectores: n })}
                  className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                    filters.minDetectores === n
                      ? 'border-accent bg-accent text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {n === 0 ? 'Cualquiera' : `≥ ${n}`}
                </button>
              ))}
            </div>
          </section>

          {/* Rango de precio */}
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Valor del contrato
            </h4>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{formatCOPCompact(filters.precioMin)}</span>
              <span>
                {Number.isFinite(filters.precioMax)
                  ? formatCOPCompact(filters.precioMax)
                  : 'Sin tope'}
              </span>
            </div>
            <div className="space-y-2">
              <input
                type="range"
                className={SLIDER_CLASS}
                min={0}
                max={stats.precioMax}
                step={stats.precioMax / 100}
                value={filters.precioMin}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    precioMin: Math.min(
                      parseFloat(e.target.value),
                      actualPrecioMax,
                    ),
                  })
                }
              />
              <input
                type="range"
                className={SLIDER_CLASS}
                min={0}
                max={stats.precioMax}
                step={stats.precioMax / 100}
                value={actualPrecioMax}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    precioMax: Math.max(parseFloat(e.target.value), filters.precioMin),
                  })
                }
              />
            </div>
          </section>

          {/* Duración */}
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Duración (días)
            </h4>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{Math.round(filters.duracionMin)}</span>
              <span>
                {Number.isFinite(filters.duracionMax)
                  ? Math.round(filters.duracionMax)
                  : '∞'}
              </span>
            </div>
            <div className="space-y-2">
              <input
                type="range"
                className={SLIDER_CLASS}
                min={0}
                max={stats.duracionMax}
                step={1}
                value={filters.duracionMin}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    duracionMin: Math.min(
                      parseFloat(e.target.value),
                      actualDuracionMax,
                    ),
                  })
                }
              />
              <input
                type="range"
                className={SLIDER_CLASS}
                min={0}
                max={stats.duracionMax}
                step={1}
                value={actualDuracionMax}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    duracionMax: Math.max(
                      parseFloat(e.target.value),
                      filters.duracionMin,
                    ),
                  })
                }
              />
            </div>
          </section>

          {/* Footer */}
          <footer className="sticky bottom-0 -mx-5 mt-4 flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-4">
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reiniciar
            </button>
            <p className="text-xs text-slate-500">
              {stats.count.toLocaleString('es-CO')} contratos disponibles
            </p>
          </footer>
        </div>
      </aside>
    </div>
  );
}

export function aplicarFiltrosAnalista(
  data: ContratoIntegrado[],
  filters: AnalystFilterState,
): ContratoIntegrado[] {
  return data.filter((d) => {
    if (d.scoreCompuesto < filters.scoreMin) return false;
    if (d.scoreCompuesto > filters.scoreMax) return false;
    if (d.nPipelinesAnomalo < filters.minDetectores) return false;
    if (d.precio < filters.precioMin) return false;
    if (Number.isFinite(filters.precioMax) && d.precio > filters.precioMax)
      return false;
    if (d.duracionDias < filters.duracionMin) return false;
    if (
      Number.isFinite(filters.duracionMax) &&
      d.duracionDias > filters.duracionMax
    )
      return false;
    return true;
  });
}
