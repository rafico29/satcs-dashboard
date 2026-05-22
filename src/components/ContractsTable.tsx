import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  Search,
} from 'lucide-react';
import type { ContratoIntegrado } from '../types';
import { formatCOP } from '../data/loadData';

interface Props {
  data: ContratoIntegrado[];
  onSelect: (contrato: ContratoIntegrado) => void;
  selectedId?: string | null;
}

type SortKey =
  | 'idProceso'
  | 'entidad'
  | 'departamento'
  | 'tipoContrato'
  | 'precio'
  | 'scoreCompuesto';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 50;

function ScoreBadge({ score }: { score: number }) {
  let label: string;
  let className: string;
  if (score > 0.7) {
    label = 'Alto';
    className = 'bg-red-100 text-red-700 ring-1 ring-red-200';
  } else if (score >= 0.4) {
    label = 'Medio';
    className = 'bg-amber-100 text-amber-800 ring-1 ring-amber-200';
  } else {
    label = 'Bajo';
    className = 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200';
  }
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs font-semibold tabular-nums text-slate-700">
        {score.toFixed(3)}
      </span>
      <span
        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${className}`}
      >
        {label}
      </span>
    </div>
  );
}

export default function ContractsTable({ data, onSelect, selectedId }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('scoreCompuesto');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (d) =>
        d.entidad.toLowerCase().includes(q) ||
        d.idProceso.toLowerCase().includes(q),
    );
  }, [data, search]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageData = sorted.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'scoreCompuesto' || key === 'precio' ? 'desc' : 'asc');
    }
    setPage(0);
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) {
      return <ArrowUpDown className="h-3 w-3 text-slate-400" />;
    }
    return sortDir === 'asc' ? (
      <ArrowUp className="h-3 w-3 text-accent" />
    ) : (
      <ArrowDown className="h-3 w-3 text-accent" />
    );
  };

  const headers: { key: SortKey; label: string; align?: string }[] = [
    { key: 'idProceso', label: 'ID Proceso' },
    { key: 'entidad', label: 'Entidad' },
    { key: 'departamento', label: 'Departamento' },
    { key: 'tipoContrato', label: 'Tipo' },
    { key: 'precio', label: 'Precio (COP)', align: 'text-right' },
    { key: 'scoreCompuesto', label: 'Score', align: 'text-right' },
  ];

  return (
    <section className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Contratos
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {sorted.length.toLocaleString('es-CO')} resultado(s) — orden por{' '}
            <strong>{sortKey}</strong> ({sortDir})
          </p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Buscar por entidad o ID..."
            className="w-72 rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      <div className="scroll-thin overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {headers.map((h) => (
                <th
                  key={h.key}
                  scope="col"
                  className={`whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 ${
                    h.align ?? ''
                  }`}
                >
                  <button
                    onClick={() => handleSort(h.key)}
                    className={`inline-flex items-center gap-1 hover:text-slate-900 ${
                      h.align === 'text-right' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <SortIcon k={h.key} />
                    {h.label}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {pageData.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-3 py-10 text-center text-sm text-slate-500"
                >
                  No hay contratos que coincidan con los filtros actuales.
                </td>
              </tr>
            ) : (
              pageData.map((c) => {
                const isSelected = selectedId === c.idProceso;
                return (
                  <tr
                    key={c.idProceso}
                    onClick={() => onSelect(c)}
                    className={`cursor-pointer transition ${
                      isSelected ? 'bg-accent/5' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="max-w-[140px] truncate px-3 py-2 font-mono text-xs text-slate-700">
                      {c.idProceso}
                    </td>
                    <td className="max-w-[260px] truncate px-3 py-2" title={c.entidad}>
                      {c.entidad}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{c.departamento}</td>
                    <td className="max-w-[180px] truncate px-3 py-2 text-slate-600">
                      {c.tipoContrato}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-slate-700">
                      {formatCOP(c.precio)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right">
                      <div className="flex justify-end">
                        <ScoreBadge score={c.scoreCompuesto} />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
        <span>
          Pagina {safePage + 1} de {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={safePage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-50"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Anterior
          </button>
          <button
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-50"
          >
            Siguiente <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
