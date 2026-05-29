import { useEffect } from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Trophy,
  FileDown,
  Info,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export type ViewKey =
  | 'dashboard'
  | 'analytics'
  | 'top'
  | 'predict'
  | 'reports'
  | 'about'
  | 'contact';

interface MenuItem {
  key: ViewKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MENU: MenuItem[] = [
  { key: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
  { key: 'analytics', label: 'Análisis', icon: BarChart3 },
  { key: 'top', label: 'Top contratos', icon: Trophy },
  { key: 'predict', label: 'Predecir CSV', icon: Sparkles },
  { key: 'reports', label: 'Reportes', icon: FileDown },
  { key: 'about', label: 'Acerca de', icon: Info },
  { key: 'contact', label: 'Contacto', icon: Mail },
];

interface Props {
  current: ViewKey;
  onChange: (view: ViewKey) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({
  current,
  onChange,
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onCloseMobile,
}: Props) {
  // Close mobile drawer on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseMobile();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mobileOpen, onCloseMobile]);

  const widthClass = collapsed ? 'lg:w-16' : 'lg:w-60';

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-slate-200 bg-navy text-slate-100 shadow-xl transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none ${widthClass} ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header / logo */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
              <ShieldAlert className="h-5 w-5 text-accent" aria-hidden="true" />
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <p className="font-bold tracking-tight">
                  <span className="text-accent">SAT</span>
                  <span className="text-critical">CS</span>
                </p>
                <p className="text-[10px] uppercase tracking-widest text-slate-400">
                  Alertas tempranas
                </p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-md p-1.5 text-slate-300 hover:bg-white/10 lg:hidden"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
          {MENU.map((item) => {
            const Icon = item.icon;
            const active = current === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  onChange(item.key);
                  onCloseMobile();
                }}
                title={collapsed ? item.label : undefined}
                className={`group relative flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-accent/15 text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1.5 h-[calc(100%-12px)] w-1 rounded-r bg-accent"
                  />
                )}
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop) */}
        <div className="hidden border-t border-white/10 px-2 py-2 lg:block">
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-slate-100"
            title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Colapsar</span>
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-4 py-3 text-[10px] uppercase tracking-widest text-slate-500">
          {collapsed ? 'v1.0' : 'SATCS v1.0 · MVP'}
        </div>
      </aside>
    </>
  );
}
