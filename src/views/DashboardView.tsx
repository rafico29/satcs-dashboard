import { useState } from 'react';
import Filters from '../components/Filters';
import KPIs from '../components/KPIs';
import ColombiaMap from '../components/ColombiaMap';
import DistributionChart from '../components/DistributionChart';
import ContractsTable from '../components/ContractsTable';
import ExplanationPanel from '../components/ExplanationPanel';
import type { ContratoIntegrado, FilterState } from '../types';

interface Props {
  data: ContratoIntegrado[];
  filtered: ContratoIntegrado[];
  filters: FilterState;
  onFiltersChange: (next: FilterState) => void;
  onResetFilters: () => void;
  departamentoSeleccionado: string | null;
  onSelectDepartamento: (depto: string | null) => void;
}

export default function DashboardView({
  data,
  filtered,
  filters,
  onFiltersChange,
  onResetFilters,
  departamentoSeleccionado,
  onSelectDepartamento,
}: Props) {
  const [selected, setSelected] = useState<ContratoIntegrado | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Resumen
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Panorama general de alertas
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Vista general del sistema: filtros activos, KPIs principales,
          distribución geográfica y listado de contratos analizados.
        </p>
      </header>

      <Filters
        data={data}
        filters={filters}
        onChange={onFiltersChange}
        onReset={onResetFilters}
      />

      <KPIs data={filtered} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ColombiaMap
            data={filtered}
            selected={departamentoSeleccionado}
            onSelect={(d) =>
              onSelectDepartamento(
                departamentoSeleccionado === d ? null : d,
              )
            }
          />
        </div>
        <div>
          <DistributionChart data={filtered} />
        </div>
      </div>

      <ContractsTable
        data={filtered}
        onSelect={setSelected}
        selectedId={selected?.idProceso ?? null}
      />

      {selected && (
        <ExplanationPanel
          contrato={selected}
          baseline={data}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
