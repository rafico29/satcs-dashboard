import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Header from './components/Header';
import Sidebar, { type ViewKey } from './components/Sidebar';
import DashboardView from './views/DashboardView';
import AnalyticsView from './views/AnalyticsView';
import TopContractsView from './views/TopContractsView';
import PredictView from './views/PredictView';
import ReportsView from './views/ReportsView';
import AboutView from './views/AboutView';
import ContactView from './views/ContactView';
import { loadIntegrado, loadTop15 } from './data/loadData';
import type { ContratoIntegrado, ContratoTop15, FilterState } from './types';

const DEFAULT_FILTERS: FilterState = {
  departamentos: [],
  tiposContrato: [],
  scoreMin: 0,
  scoreMax: 1,
  soloAlertas: false,
  busqueda: '',
  anios: [],
};

const TITLES: Record<ViewKey, string> = {
  dashboard: 'Resumen',
  analytics: 'Análisis profundo',
  top: 'Top contratos',
  predict: 'Predecir desde CSV',
  reports: 'Reportes y descargas',
  about: 'Acerca de SATCS',
  contact: 'Contacto',
};

export default function App() {
  const [data, setData] = useState<ContratoIntegrado[]>([]);
  const [top15, setTop15] = useState<ContratoTop15[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState<
    string | null
  >(null);

  const [currentView, setCurrentView] = useState<ViewKey>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadIntegrado(), loadTop15()])
      .then(([rows, top]) => {
        if (cancelled) return;
        setData(rows);
        setTop15(top);
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return data.filter((d) => {
      if (
        filters.departamentos.length > 0 &&
        !filters.departamentos.includes(d.departamento)
      )
        return false;
      if (
        filters.tiposContrato.length > 0 &&
        !filters.tiposContrato.includes(d.tipoContrato)
      )
        return false;
      if (
        d.scoreCompuesto < filters.scoreMin ||
        d.scoreCompuesto > filters.scoreMax
      )
        return false;
      if (filters.soloAlertas && d.nPipelinesAnomalo < 1) return false;
      if (
        filters.anios.length > 0 &&
        !filters.anios.includes(d.anioProceso)
      )
        return false;
      if (
        departamentoSeleccionado &&
        d.departamento !== departamentoSeleccionado
      )
        return false;
      return true;
    });
  }, [data, filters, departamentoSeleccionado]);

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setDepartamentoSeleccionado(null);
  };

  const renderView = () => {
    if (loading) {
      return (
        <div className="flex h-[60vh] items-center justify-center text-slate-500">
          <Loader2 className="mr-2 h-6 w-6 animate-spin text-accent" />
          Cargando datos…
        </div>
      );
    }
    if (error) {
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <p className="font-semibold">No se pudieron cargar los datos.</p>
          <p className="mt-1 font-mono text-xs">{error}</p>
          <p className="mt-2 text-xs text-red-600">
            Verifica que <code>public/data/integrado.csv</code> y{' '}
            <code>public/data/top15.csv</code> existan en el despliegue.
          </p>
        </div>
      );
    }
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            data={data}
            filtered={filtered}
            filters={filters}
            onFiltersChange={setFilters}
            onResetFilters={handleResetFilters}
            departamentoSeleccionado={departamentoSeleccionado}
            onSelectDepartamento={setDepartamentoSeleccionado}
          />
        );
      case 'analytics':
        return <AnalyticsView data={filtered.length > 0 ? filtered : data} />;
      case 'top':
        return <TopContractsView top15={top15} />;
      case 'predict':
        return <PredictView />;
      case 'reports':
        return <ReportsView />;
      case 'about':
        return <AboutView />;
      case 'contact':
        return <ContactView />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar
        current={currentView}
        onChange={setCurrentView}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={TITLES[currentView]}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />

        <main className="flex-1 px-4 py-6 md:px-8">
          <div className="mx-auto max-w-[1500px]">{renderView()}</div>

          <footer className="mx-auto mt-10 max-w-[1500px] text-center text-xs text-slate-400">
            SATCS — Sistema de Alertas Tempranas en Contratación de Salud ·{' '}
            {data.length.toLocaleString('es-CO')} contratos analizados
          </footer>
        </main>
      </div>
    </div>
  );
}
