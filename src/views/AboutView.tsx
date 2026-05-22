import {
  Compass,
  Target,
  Lightbulb,
  Workflow,
  ArrowRight,
} from 'lucide-react';

interface PipelineStep {
  step: string;
  role: string;
  description: string;
  color: string;
  bg: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PIPELINE: PipelineStep[] = [
  {
    step: 'GMM',
    role: 'Descubrir',
    description:
      'Mixturas Gaussianas detectan agrupaciones inusuales en el espacio multidimensional de contratos.',
    color: 'text-accent',
    bg: 'bg-accent/10',
    icon: Compass,
  },
  {
    step: 'SVM RBF',
    role: 'Detectar',
    description:
      'Una One-Class SVM con kernel RBF aprende la frontera de los contratos típicos para señalar anomalías.',
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    icon: Target,
  },
  {
    step: 'LR',
    role: 'Explicar',
    description:
      'La regresión logística calibra las probabilidades y aporta interpretabilidad a cada alerta.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
    icon: Lightbulb,
  },
];

const METRICS = [
  { label: 'Recall', value: '86%', color: 'text-accent' },
  { label: 'AUC', value: '0.93', color: 'text-emerald-600' },
  { label: 'F1', value: '0.48', color: 'text-amber-600' },
  { label: 'Precision', value: '33%', color: 'text-red-600' },
];

interface TeamMember {
  name: string;
  role: string;
  initials: string;
  color: string;
}

const TEAM: TeamMember[] = [
  {
    name: 'Rafael Salgado',
    role: 'Líder Técnico',
    initials: 'RS',
    color: 'bg-accent',
  },
  {
    name: 'Felipe Vargas',
    role: 'Líder Técnico',
    initials: 'FV',
    color: 'bg-indigo-500',
  },
  {
    name: 'Marcela Gallego',
    role: 'Product Owner',
    initials: 'MG',
    color: 'bg-amber-500',
  },
  {
    name: 'Lina Moncada',
    role: 'Data Analyst',
    initials: 'LM',
    color: 'bg-rose-500',
  },
  {
    name: 'Sebastián Aponte',
    role: 'Desarrollador PyApp',
    initials: 'SA',
    color: 'bg-emerald-500',
  },
];

export default function AboutView() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Acerca de
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Sobre SATCS</h1>
        <p className="mt-1 text-sm text-slate-500">
          Un sistema de alertas tempranas para auditar la contratación pública
          en salud usando inteligencia artificial multimodelo.
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          ¿Qué es SATCS?
        </h2>
        <div className="prose prose-sm mt-3 max-w-none space-y-3 text-slate-600">
          <p>
            SATCS (Sistema de Alertas Tempranas en Contratación de Salud) es
            una plataforma analítica que combina varios modelos de detección de
            anomalías para identificar contratos públicos del sector salud que
            presentan patrones atípicos. El objetivo es priorizar los casos
            donde una auditoría puede generar mayor impacto.
          </p>
          <p>
            La solución integra fuentes abiertas (SECOP), índices de
            transparencia territorial e indicadores fiscales departamentales,
            normaliza la información y la procesa a través de tres pipelines
            complementarios. Cada contrato recibe un <em>score compuesto</em>{' '}
            que resume la probabilidad de que sea anómalo y un conteo del
            consenso entre modelos.
          </p>
          <p>
            La estrategia multimodelo permite balancear recall y precisión:
            mientras un modelo no supervisado captura outliers raros, un modelo
            supervisado aprende patrones históricos de irregularidad. La capa
            de calibración final aporta probabilidades comparables y reglas de
            negocio interpretables para auditores.
          </p>
          <p>
            SATCS es un MVP académico que prioriza transparencia metodológica
            sobre cobertura exhaustiva. Sus resultados son una guía para la
            revisión humana, nunca un dictamen automático.
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-700">
          <Workflow className="h-4 w-4 text-accent" />
          Pipeline
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-stretch">
          {PIPELINE.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="relative">
                <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-card">
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${step.bg} ${step.color}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Etapa {idx + 1} · {step.role}
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {step.step}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {step.description}
                  </p>
                </article>
                {idx < PIPELINE.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-slate-300 md:block" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-700">
          Métricas del modelo
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {METRICS.map((metric) => (
            <article
              key={metric.label}
              className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-card"
            >
              <p className={`text-3xl font-bold ${metric.color}`}>
                {metric.value}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {metric.label}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-700">
          Equipo
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {TEAM.map((member) => (
            <article
              key={member.name}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-card"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full text-base font-bold text-white ${member.color}`}
              >
                {member.initials}
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900">
                  {member.name}
                </p>
                <p className="text-xs text-slate-500">{member.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
