import { X, Users, Target, Layers, Sparkles } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface Member {
  initials: string;
  name: string;
  role: string;
  color: string;
}

const TEAM: Member[] = [
  { initials: 'FV', name: 'Felipe Vargas', role: 'Líder Técnico', color: 'bg-blue-100 text-blue-700' },
  { initials: 'RS', name: 'Rafael Salgado', role: 'Líder Técnico', color: 'bg-indigo-100 text-indigo-700' },
  { initials: 'MG', name: 'Marcela Gallego', role: 'Product Owner', color: 'bg-emerald-100 text-emerald-700' },
  { initials: 'LM', name: 'Lina Moncada', role: 'Data Analyst', color: 'bg-amber-100 text-amber-700' },
  { initials: 'SA', name: 'Sebastián Aponte', role: 'Desarrollador PyApp', color: 'bg-rose-100 text-rose-700' },
];

export default function AboutPanel({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-accent/10 p-2 text-accent">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy">Acerca del proyecto</h2>
              <p className="text-xs text-slate-500">SATCS — Sistema de Alertas Tempranas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 p-6">
          {/* Misión */}
          <section>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-700">
              <Target className="h-4 w-4 text-accent" />
              Misión
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              Detectar anomalías en contratos de salud pública del SECOP de
              Colombia mediante un pipeline híbrido de detección de anomalías
              que combina aprendizaje no supervisado, supervisado e
              interpretable. El objetivo es entregar al auditor alertas
              accionables con explicación legible.
            </p>
          </section>

          {/* Pipeline */}
          <section>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-700">
              <Layers className="h-4 w-4 text-accent" />
              Pipeline en 3 fases
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { num: '1', name: 'GMM', desc: 'Descubre los perfiles de contratación y genera las etiquetas (no supervisado).' },
                { num: '2', name: 'SVM RBF', desc: 'Detector con kernel gaussiano. AUC 0.93, Recall 86%.' },
                { num: '3', name: 'Reg. Logística', desc: 'Explica al auditor las variables que disparan cada alerta.' },
              ].map((p) => (
                <div
                  key={p.num}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="mb-1 flex items-baseline gap-2">
                    <span className="text-lg font-bold text-accent">{p.num}.</span>
                    <span className="font-semibold text-navy">{p.name}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600">{p.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Equipo */}
          <section>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-700">
              <Users className="h-4 w-4 text-accent" />
              Equipo
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {TEAM.map((m) => (
                <div
                  key={m.name}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition hover:border-accent/30 hover:bg-slate-50"
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${m.color}`}
                  >
                    {m.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-navy">{m.name}</p>
                    <p className="truncate text-xs text-slate-500">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer info */}
          <section className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
            <p>
              <strong className="text-slate-700">Especialización:</strong>{' '}
              Inteligencia Artificial · Ciclo 3A — Sprint 5 (Model Prototyping)
            </p>
            <p className="mt-1">
              <strong className="text-slate-700">Datos:</strong> SECOP II ·
              estructura real + scores de modelos
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
