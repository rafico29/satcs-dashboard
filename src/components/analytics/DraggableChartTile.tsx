import { useRef, useState } from 'react';
import { GripVertical, MoreVertical, EyeOff, Image, FileDown } from 'lucide-react';
import { toPng } from 'html-to-image';
import type { ChartDefinition } from './ChartConfig';
import type { ContratoIntegrado } from '../../types';

interface Props {
  definition: ChartDefinition;
  data: ContratoIntegrado[];
  onHide: (id: string) => void;
  onExportCsv: (id: string) => void;
}

export default function DraggableChartTile({
  definition,
  data,
  onHide,
  onExportCsv,
}: Props) {
  const tileRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const Comp = definition.component;

  const handleExportPng = async () => {
    setMenuOpen(false);
    if (!tileRef.current) return;
    try {
      const dataUrl = await toPng(tileRef.current, {
        backgroundColor: '#ffffff',
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `satcs-${definition.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error al exportar PNG', err);
    }
  };

  return (
    <div
      ref={tileRef}
      className="relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card"
    >
      {/* Toolbar superior con drag handle y menú */}
      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-1.5">
        <div className="drag-handle flex h-7 w-7 cursor-move items-center justify-center text-slate-400 hover:text-slate-700">
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Opciones"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen && (
            <>
              <button
                type="button"
                aria-label="Cerrar menu"
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 z-10 cursor-default"
              />
              <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                <button
                  onClick={handleExportPng}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Image className="h-4 w-4 text-slate-400" />
                  Exportar PNG
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onExportCsv(definition.id);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  <FileDown className="h-4 w-4 text-slate-400" />
                  Exportar CSV
                </button>
                <div className="border-t border-slate-100" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onHide(definition.id);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                >
                  <EyeOff className="h-4 w-4" />
                  Ocultar gráfico
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Contenido del chart */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <Comp data={data} />
      </div>
    </div>
  );
}
