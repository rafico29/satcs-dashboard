import { useEffect, useMemo, useState } from 'react';
// react-grid-layout tiene tipos imperfectos publicados; usamos casts a any en los puntos
// donde los tipos publicados no se alinean con la API real (cols, rowHeight, etc).
import GridLayout from 'react-grid-layout';
import {
  Sliders,
  LayoutGrid,
  RotateCcw,
  Download,
  TrendingUp,
} from 'lucide-react';

import type { ContratoIntegrado } from '../types';
import {
  CHART_DEFINITIONS,
  buildDefaultLayout,
  type LayoutItem,
} from '../components/analytics/ChartConfig';
import DraggableChartTile from '../components/analytics/DraggableChartTile';
import ChartLibraryPanel from '../components/analytics/ChartLibraryPanel';
import AnalystFilters, {
  DEFAULT_ANALYST_FILTERS,
  type AnalystFilterState,
  aplicarFiltrosAnalista,
} from '../components/analytics/AnalystFilters';

interface Props {
  data: ContratoIntegrado[];
}

const STORAGE_KEY_LAYOUT = 'satcs-analytics-layout-v6';
const STORAGE_KEY_VISIBLE = 'satcs-analytics-visible-v6';
const STORAGE_KEY_FILTERS = 'satcs-analytics-filters-v6';

const ALL_IDS = CHART_DEFINITIONS.map((c) => c.id);

function loadLayoutFromStorage(): LayoutItem[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LAYOUT);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as LayoutItem[];
  } catch {
    return null;
  }
}

function loadVisibleFromStorage(): string[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VISIBLE);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((id) => ALL_IDS.includes(id));
  } catch {
    return null;
  }
}

function loadFiltersFromStorage(): AnalystFilterState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FILTERS);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AnalystFilterState;
    return {
      ...DEFAULT_ANALYST_FILTERS,
      ...parsed,
      // localStorage no preserva Infinity, hay que reconstruir
      precioMax: Number.isFinite(parsed.precioMax)
        ? parsed.precioMax
        : Number.POSITIVE_INFINITY,
      duracionMax: Number.isFinite(parsed.duracionMax)
        ? parsed.duracionMax
        : Number.POSITIVE_INFINITY,
    };
  } catch {
    return null;
  }
}

function saveFiltersToStorage(filters: AnalystFilterState) {
  // Reemplazar Infinity por null para que JSON.stringify no lo pierda
  const serializable = {
    ...filters,
    precioMax: Number.isFinite(filters.precioMax) ? filters.precioMax : null,
    duracionMax: Number.isFinite(filters.duracionMax)
      ? filters.duracionMax
      : null,
  };
  localStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(serializable));
}

export default function AnalyticsView({ data }: Props) {
  const [containerWidth, setContainerWidth] = useState(1200);
  const [visibleIds, setVisibleIds] = useState<string[]>(
    () => loadVisibleFromStorage() ?? ALL_IDS,
  );
  const [layout, setLayout] = useState<LayoutItem[]>(
    () => loadLayoutFromStorage() ?? buildDefaultLayout(ALL_IDS),
  );
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<AnalystFilterState>(
    () => loadFiltersFromStorage() ?? DEFAULT_ANALYST_FILTERS,
  );

  // Aplicar filtros del analista al dataset
  const filteredData = useMemo(
    () => aplicarFiltrosAnalista(data, filters),
    [data, filters],
  );

  // Medir ancho del contenedor para el GridLayout
  useEffect(() => {
    const measure = () => {
      const el = document.getElementById('analytics-grid-container');
      if (el) {
        setContainerWidth(el.clientWidth);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Persistir cambios de layout
  const handleLayoutChange = (newLayout: LayoutItem[]) => {
    // Forzar copia mutable para satisfacer tipos
    const copy = [...newLayout];
    setLayout(copy);
    localStorage.setItem(STORAGE_KEY_LAYOUT, JSON.stringify(copy));
  };

  const persistVisibleIds = (ids: string[]) => {
    setVisibleIds(ids);
    localStorage.setItem(STORAGE_KEY_VISIBLE, JSON.stringify(ids));
  };

  const handleHideChart = (id: string) => {
    persistVisibleIds(visibleIds.filter((v) => v !== id));
  };

  const handleToggleChart = (id: string) => {
    if (visibleIds.includes(id)) {
      persistVisibleIds(visibleIds.filter((v) => v !== id));
    } else {
      const newIds = [...visibleIds, id];
      persistVisibleIds(newIds);
      // Asegurar que el layout incluye el nuevo chart
      const exists = layout.some((l) => l.i === id);
      if (!exists) {
        const def = CHART_DEFINITIONS.find((c) => c.id === id);
        const newLayout: LayoutItem[] = [
          ...layout,
          {
            i: id,
            x: 0,
            y: Number.MAX_SAFE_INTEGER,
            w: def?.defaultW ?? 4,
            h: def?.defaultH ?? 5,
            minW: def?.minW,
            minH: def?.minH,
          },
        ];
        handleLayoutChange(newLayout);
      }
    }
  };

  const handleResetLayout = () => {
    persistVisibleIds(ALL_IDS);
    const fresh = buildDefaultLayout(ALL_IDS);
    handleLayoutChange(fresh);
    setFilters(DEFAULT_ANALYST_FILTERS);
    saveFiltersToStorage(DEFAULT_ANALYST_FILTERS);
  };

  const handleFiltersChange = (next: AnalystFilterState) => {
    setFilters(next);
    saveFiltersToStorage(next);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_ANALYST_FILTERS);
    saveFiltersToStorage(DEFAULT_ANALYST_FILTERS);
  };

  // Exportar el dataset filtrado completo a CSV
  const handleExportFullCsv = () => {
    if (filteredData.length === 0) return;
    const cols = [
      'idProceso',
      'entidad',
      'departamento',
      'ciudad',
      'tipoContrato',
      'precio',
      'duracionDias',
      'precioPorDia',
      'ita',
      'idf',
      'scoreCompuesto',
      'nPipelinesAnomalo',
      'kmeansAnomalia',
      'gmmAnomalia',
      'iforestAnomalia',
      'lofAnomalia',
      'mlpAnomalia',
      'svmRbfAnomalia',
      'mlpProbAnomalia',
      'svmRbfProb',
      'anioProceso',
    ] as const;
    const header = cols.join(',');
    const rows = filteredData.map((d) =>
      cols
        .map((c) => {
          const v = d[c];
          if (typeof v === 'string') {
            // Escapar comillas y wrap si tiene comas
            const escaped = v.replace(/"/g, '""');
            return /[",\n]/.test(v) ? `"${escaped}"` : escaped;
          }
          return v;
        })
        .join(','),
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `satcs-contratos-filtrados-${filteredData.length}.csv`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Exportar dataset por chart específico (mismo CSV por ahora; en el futuro se puede
  // adaptar por tipo de chart, pero conservamos simplicidad).
  const handleExportChartCsv = (_id: string) => {
    handleExportFullCsv();
  };

  // Detectar si hay cambios respecto a la configuración por defecto
  const hasChanges =
    visibleIds.length !== ALL_IDS.length ||
    JSON.stringify(filters) !== JSON.stringify(DEFAULT_ANALYST_FILTERS);

  const filteredCount = filteredData.length;
  const totalCount = data.length;
  const isFiltered = filteredCount !== totalCount;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Análisis · modo analista
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Espacio de exploración
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Reorganiza, oculta o redimensiona los gráficos arrastrándolos.
            Aplica filtros avanzados y exporta los hallazgos. La configuración
            se guarda automáticamente en este navegador.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFiltersOpen(true)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
              isFiltered
                ? 'border-accent bg-accent text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Sliders className="h-4 w-4" />
            Filtros
            {isFiltered && (
              <span className="rounded-full bg-white/20 px-1.5 text-xs">
                {filteredCount.toLocaleString('es-CO')}
              </span>
            )}
          </button>
          <button
            onClick={() => setLibraryOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <LayoutGrid className="h-4 w-4" />
            Gráficos ({visibleIds.length}/{ALL_IDS.length})
          </button>
          <button
            onClick={handleExportFullCsv}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            disabled={filteredCount === 0}
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
          <button
            onClick={handleResetLayout}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            disabled={!hasChanges}
            title="Reiniciar layout, filtros y visibilidad"
          >
            <RotateCcw className="h-4 w-4" />
            Reiniciar
          </button>
        </div>
      </header>

      {/* Banner de filtros activos */}
      {isFiltered && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            <span className="font-semibold text-slate-900">
              Mostrando {filteredCount.toLocaleString('es-CO')} de{' '}
              {totalCount.toLocaleString('es-CO')} contratos
            </span>
            <span className="text-slate-600">
              ({((filteredCount / totalCount) * 100).toFixed(1)}% del total)
            </span>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-xs font-semibold text-accent hover:underline"
          >
            Quitar filtros
          </button>
        </div>
      )}

      {/* Grid de gráficos */}
      <div id="analytics-grid-container" className="w-full">
        {visibleIds.length === 0 ? (
          <div className="flex h-96 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <LayoutGrid className="h-12 w-12 text-slate-400" />
            <p className="text-base font-semibold text-slate-700">
              No hay gráficos visibles
            </p>
            <p className="text-sm text-slate-500">
              Abre la biblioteca de gráficos para agregar visualizaciones.
            </p>
            <button
              onClick={() => setLibraryOpen(true)}
              className="mt-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90"
            >
              Agregar gráficos
            </button>
          </div>
        ) : (
          <GridLayout
            {...({
              className: 'layout',
              layout: layout.filter((l) => visibleIds.includes(l.i)),
              cols: 12,
              rowHeight: 32,
              width: containerWidth,
              margin: [16, 16],
              draggableHandle: '.drag-handle',
              isDraggable: true,
              isResizable: true,
              compactType: 'vertical',
              preventCollision: false,
              onLayoutChange: (l: LayoutItem[]) => handleLayoutChange([...l]),
            } as any)}
          >
            {visibleIds.map((id) => {
              const def = CHART_DEFINITIONS.find((c) => c.id === id);
              if (!def) return null;
              return (
                <div key={id}>
                  <DraggableChartTile
                    definition={def}
                    data={filteredData}
                    onHide={handleHideChart}
                    onExportCsv={handleExportChartCsv}
                  />
                </div>
              );
            })}
          </GridLayout>
        )}
      </div>

      {/* Paneles laterales */}
      <ChartLibraryPanel
        open={libraryOpen}
        visibleIds={visibleIds}
        onToggle={handleToggleChart}
        onClose={() => setLibraryOpen(false)}
      />
      <AnalystFilters
        open={filtersOpen}
        filters={filters}
        onChange={handleFiltersChange}
        onClose={() => setFiltersOpen(false)}
        onReset={handleResetFilters}
        data={data}
      />
    </div>
  );
}
