import { useState } from 'react';
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileBarChart2,
  Lock,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

type Status = 'idle' | 'loading' | 'done' | 'error';

interface ReportSpec {
  id: string;
  title: string;
  description: string;
  filename?: string;
  source?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  available: boolean;
  comingSoonNote?: string;
}

const REPORTS: ReportSpec[] = [
  {
    id: 'top15',
    title: 'Top 15 contratos prioritarios',
    description:
      'Casos con mayor score de riesgo, listos para auditoría. Incluye entidad, departamento, valor y modelos que detectaron la anomalía.',
    filename: 'satcs_top15.csv',
    source: 'data/top15.csv',
    icon: FileText,
    iconColor: 'text-accent',
    iconBg: 'bg-accent/10',
    available: true,
  },
  {
    id: 'integrado',
    title: 'Dataset integrado completo',
    description:
      'Todos los contratos analizados con scores, banderas por modelo y métricas asociadas (ITA, IDF, riesgo fiscal, transparencia).',
    filename: 'satcs_integrado.csv',
    source: 'data/integrado.csv',
    icon: FileSpreadsheet,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
    available: true,
  },
  {
    id: 'ejecutivo',
    title: 'Reporte ejecutivo (PDF)',
    description:
      'Resumen narrativo con hallazgos principales, gráficos de soporte y recomendaciones para la alta dirección.',
    icon: FileBarChart2,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
    available: false,
    comingSoonNote: 'Próximamente',
  },
  {
    id: 'memoria',
    title: 'Memoria técnica del modelo (PDF)',
    description:
      'Especificación detallada del pipeline GMM → SVM RBF → Regresión Logística, métricas, validación y limitaciones.',
    icon: FileBarChart2,
    iconColor: 'text-slate-600',
    iconBg: 'bg-slate-100',
    available: false,
    comingSoonNote: 'Próximamente',
  },
];

const BASE = import.meta.env.BASE_URL;

async function downloadReport(report: ReportSpec): Promise<void> {
  if (!report.source || !report.filename) return;
  const url = `${BASE}${report.source}`.replace(/\/+/g, '/');
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo descargar (${res.status})`);
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = report.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
}

function StatusBadge({ status }: { status: Status }) {
  if (status === 'loading') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
        <Loader2 className="h-3 w-3 animate-spin" />
        Descargando…
      </span>
    );
  }
  if (status === 'done') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
        <CheckCircle2 className="h-3 w-3" />
        Descargado
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-red-600">
        <AlertTriangle className="h-3 w-3" />
        Falló la descarga
      </span>
    );
  }
  return null;
}

export default function ReportsView() {
  const [statuses, setStatuses] = useState<Record<string, Status>>({});

  const handleDownload = async (report: ReportSpec) => {
    setStatuses((s) => ({ ...s, [report.id]: 'loading' }));
    try {
      await downloadReport(report);
      setStatuses((s) => ({ ...s, [report.id]: 'done' }));
    } catch (err) {
      console.error(err);
      setStatuses((s) => ({ ...s, [report.id]: 'error' }));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Reportes
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Reportes y descargas
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Exporta los datasets utilizados por el pipeline o descarga los
          reportes ejecutivos para tu equipo de auditoría.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {REPORTS.map((report) => {
          const Icon = report.icon;
          const status = statuses[report.id] ?? 'idle';
          return (
            <article
              key={report.id}
              className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-card"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${report.iconBg} ${report.iconColor}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    {report.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {report.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <StatusBadge status={status} />
                {report.available ? (
                  <button
                    type="button"
                    onClick={() => handleDownload(report)}
                    disabled={status === 'loading'}
                    className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    Descargar
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    title={report.comingSoonNote ?? 'Próximamente'}
                    className="inline-flex cursor-not-allowed items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-400"
                  >
                    <Lock className="h-4 w-4" />
                    Próximamente
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
