import { X, Plus, Eye } from 'lucide-react';
import { CHART_DEFINITIONS } from './ChartConfig';

interface Props {
  open: boolean;
  visibleIds: string[];
  onToggle: (id: string) => void;
  onClose: () => void;
}

export default function ChartLibraryPanel({
  open,
  visibleIds,
  onToggle,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex">
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar biblioteca"
        className="flex-1 bg-slate-900/30 backdrop-blur-sm"
      />
      <aside className="scroll-thin flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Biblioteca de gráficos
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {visibleIds.length} de {CHART_DEFINITIONS.length} visibles
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex flex-col gap-3 p-5">
          {CHART_DEFINITIONS.map((def) => {
            const isVisible = visibleIds.includes(def.id);
            return (
              <button
                key={def.id}
                onClick={() => onToggle(def.id)}
                className={`flex items-start justify-between gap-3 rounded-lg border p-4 text-left transition ${
                  isVisible
                    ? 'border-accent/50 bg-accent/5 hover:bg-accent/10'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {def.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {def.description}
                  </p>
                </div>
                <div
                  className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                    isVisible
                      ? 'bg-accent text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isVisible ? (
                    <Eye className="h-3.5 w-3.5" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
