import { useMemo } from 'react';
import { CalendarDays, MapPin, FileText, AlertTriangle, RotateCcw } from 'lucide-react';
import type { ContratoIntegrado, FilterState } from '../types';

interface Props {
  data: ContratoIntegrado[];
  filters: FilterState;
  onChange: (next: FilterState) => void;
  onReset: () => void;
}

function MultiSelect({
  label,
  icon,
  options,
  selected,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
        {icon}
        {label}
        {selected.length > 0 && (
          <span className="ml-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
            {selected.length}
          </span>
        )}
      </label>
      <div className="scroll-thin max-h-40 overflow-y-auto rounded-md border border-slate-200 bg-white p-2">
        {options.length === 0 ? (
          <p className="text-xs text-slate-400">Sin opciones</p>
        ) : (
          options.map((opt) => (
            <label
              key={opt}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-slate-50"
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
              />
              <span className="truncate" title={opt}>
                {opt}
              </span>
            </label>
          ))
        )}
      </div>
    </div>
  );
}

export default function Filters({ data, filters, onChange, onReset }: Props) {
  const departamentos = useMemo(() => {
    const set = new Set<string>();
    data.forEach((d) => d.departamento && set.add(d.departamento));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [data]);

  const tiposContrato = useMemo(() => {
    const set = new Set<string>();
    data.forEach((d) => d.tipoContrato && set.add(d.tipoContrato));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [data]);

  const anios = useMemo(() => {
    const set = new Set<number>();
    data.forEach((d) => {
      if (d.anioProceso && Number.isFinite(d.anioProceso)) {
        set.add(d.anioProceso);
      }
    });
    return [...set].sort((a, b) => b - a);
  }, [data]);

  const update = <K extends keyof FilterState,>(key: K, value: FilterState[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Filtros
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Limpiar
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {/* Periodo (filtro por año) */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <CalendarDays className="h-3.5 w-3.5" />
            Periodo
            {filters.anios.length > 0 && (
              <span className="ml-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
                {filters.anios.length}
              </span>
            )}
          </label>
          <div className="scroll-thin max-h-40 overflow-y-auto rounded-md border border-slate-200 bg-white p-2">
            {anios.length === 0 ? (
              <p className="text-xs text-slate-400">Sin años disponibles</p>
            ) : (
              anios.map((year) => (
                <label
                  key={year}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
                    checked={filters.anios.includes(year)}
                    onChange={() => {
                      const next = filters.anios.includes(year)
                        ? filters.anios.filter((y) => y !== year)
                        : [...filters.anios, year];
                      update('anios', next);
                    }}
                  />
                  <span>{year}</span>
                </label>
              ))
            )}
          </div>
        </div>

        <MultiSelect
          label="Departamento"
          icon={<MapPin className="h-3.5 w-3.5" />}
          options={departamentos}
          selected={filters.departamentos}
          onChange={(next) => update('departamentos', next)}
        />

        <MultiSelect
          label="Tipo de contrato"
          icon={<FileText className="h-3.5 w-3.5" />}
          options={tiposContrato}
          selected={filters.tiposContrato}
          onChange={(next) => update('tiposContrato', next)}
        />

        {/* Rango de score */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            Score de riesgo
          </label>
          <div className="flex flex-col gap-2 rounded-md border border-slate-200 bg-white p-3 text-sm">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Min: {filters.scoreMin.toFixed(2)}</span>
              <span>Max: {filters.scoreMax.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={filters.scoreMin}
              onChange={(e) =>
                update(
                  'scoreMin',
                  Math.min(Number(e.target.value), filters.scoreMax),
                )
              }
              className="accent-accent"
            />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={filters.scoreMax}
              onChange={(e) =>
                update(
                  'scoreMax',
                  Math.max(Number(e.target.value), filters.scoreMin),
                )
              }
              className="accent-accent"
            />
          </div>
        </div>

        {/* Toggle solo alertas */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            Alertas
          </label>
          <button
            type="button"
            onClick={() => update('soloAlertas', !filters.soloAlertas)}
            className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm transition ${
              filters.soloAlertas
                ? 'border-accent bg-accent/5 text-accent'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Solo alertas (≥1 modelo)</span>
            <span
              className={`ml-3 inline-flex h-5 w-9 items-center rounded-full border transition ${
                filters.soloAlertas
                  ? 'border-accent bg-accent'
                  : 'border-slate-300 bg-slate-200'
              }`}
            >
              <span
                className={`h-4 w-4 transform rounded-full bg-white shadow transition ${
                  filters.soloAlertas ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
