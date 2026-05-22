import { Menu, Info } from 'lucide-react';

interface Props {
  title?: string;
  onOpenMobileMenu?: () => void;
  onOpenAbout?: () => void;
}

export default function Header({ title, onOpenMobileMenu, onOpenAbout }: Props) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 shadow-sm md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Abrir menú"
          className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="leading-tight">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            SATCS · Salud
          </p>
          <h1 className="text-sm font-semibold text-slate-800">
            {title ?? 'Sistema de Alertas Tempranas en Contratación de Salud'}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenAbout}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-accent/50 hover:bg-slate-50 hover:text-accent"
        >
          <Info className="h-3.5 w-3.5" />
          Acerca de
        </button>

        <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          En línea
        </div>
      </div>
    </header>
  );
}
