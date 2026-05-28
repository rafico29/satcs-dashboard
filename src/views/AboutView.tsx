import {
  Compass,
  Target,
  Lightbulb,
  Brain,
  Network,
  Sparkles,
  Workflow,
  ArrowRight,
} from 'lucide-react';

interface DetectorRow {
  nombre: string;
  desc: string;
  rol: 'No supervisado' | 'Supervisado';
  color: string;
  bg: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DETECTORES: DetectorRow[] = [
  {
    nombre: 'K-Means',
    desc: 'Clustering por distancia euclidiana. Marca contratos lejos de su centroide y clusters pequeños.',
    rol: 'No supervisado',
    color: 'text-violet-600',
    bg: 'bg-violet-100',
    icon: Compass,
  },
  {
    nombre: 'GMM (Mixturas Gaussianas)',
    desc: 'Modela la densidad probabilística de los contratos. Detecta los de log-probabilidad más baja.',
    rol: 'No supervisado',
    color: 'text-accent',
    bg: 'bg-accent/10',
    icon: Sparkles,
  },
  {
    nombre: 'Isolation Forest',
    desc: 'Árboles aleatorios. Aísla puntos atípicos en pocos cortes — eficaz para outliers individuales.',
    rol: 'No supervisado',
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
    icon: Network,
  },
  {
    nombre: 'LOF',
    desc: 'Local Outlier Factor. Compara la densidad local de un contrato con la de sus vecinos cercanos.',
    rol: 'No supervisado',
    color: 'text-cyan-600',
    bg: 'bg-cyan-100',
    icon: Workflow,
  },
  {
    nombre: 'SVM RBF',
    desc: 'Kernel gaussiano. Aprende la frontera no lineal entre contratos normales y atípicos.',
    rol: 'Supervisado',
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    icon: Target,
  },
  {
    nombre: 'MLP (Red Neuronal)',
    desc: 'Multilayer Perceptron 64→32. Captura interacciones complejas y produce el mejor F1 (0.815).',
    rol: 'Supervisado',
    color: 'text-rose-600',
    bg: 'bg-rose-100',
    icon: Brain,
  },
];

const PIPELINE_STEPS = [
  {
    step: 'Descubrir',
    description:
      'Cuatro modelos no supervisados (K-Means, GMM, Isolation Forest, LOF) identifican contratos atípicos sin etiquetas previas y construyen una etiqueta consenso.',
    color: 'text-accent',
    bg: 'bg-accent/10',
    icon: Compass,
  },
  {
    step: 'Detectar',
    description:
      'Dos modelos supervisados (SVM RBF y Red Neuronal MLP) se entrenan sobre la etiqueta consenso para aprender la frontera entre contratos normales y anómalos.',
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    icon: Target,
  },
  {
    step: 'Explicar',
    description:
      'El score compuesto integra las 6 señales en una probabilidad calibrada. La interfaz muestra cuáles modelos detectaron cada contrato y por qué.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
    icon: Lightbulb,
  },
];

const METRICS = [
  { label: 'F1 (MLP)', value: '0.815', color: 'text-accent', sub: 'Red Neuronal' },
  { label: 'AUC (MLP)', value: '0.996', color: 'text-emerald-600', sub: 'Casi perfecto' },
  { label: 'Recall (SVM RBF)', value: '100%', color: 'text-amber-600', sub: 'Captura todas' },
  { label: 'Modelos', value: '6', color: 'text-rose-600', sub: 'Multimodelo' },
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
          Sistema de alertas tempranas para auditar la contratación pública en
          salud usando inteligencia artificial multimodelo (6 detectores).
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          ¿Qué es SATCS?
        </h2>
        <div className="prose prose-sm mt-3 max-w-none space-y-3 text-slate-600">
          <p>
            SATCS (Sistema de Alertas Tempranas en Contratación de Salud) es
            una plataforma analítica que combina <strong>seis modelos de detección de
            anomalías</strong> (cuatro no supervisados y dos supervisados) para
            identificar contratos públicos del sector salud que presentan
            patrones atípicos. El objetivo es priorizar los casos donde una
            auditoría puede generar mayor impacto.
          </p>
          <p>
            La solución integra fuentes abiertas (SECOP), índices de
            transparencia territorial (ITA) e indicadores fiscales
            departamentales (IDF), normaliza la información y la procesa a
            través de pipelines complementarios. Cada contrato recibe un{' '}
            <em>score compuesto</em> que resume la probabilidad de que sea
            anómalo y un conteo de cuántos modelos coinciden en la alerta.
          </p>
          <p>
            La estrategia multimodelo busca balancear recall y precisión:
            mientras los modelos no supervisados (K-Means, GMM, Isolation
            Forest, LOF) descubren outliers desde distintos ángulos, los
            supervisados (SVM RBF, MLP) refinan la frontera de decisión a
            partir de la etiqueta consenso. La capa final de calibración aporta
            probabilidades comparables y reglas de negocio interpretables.
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
          Pipeline de tres etapas
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-stretch">
          {PIPELINE_STEPS.map((step, idx) => {
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
                    Etapa {idx + 1}
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {step.step}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {step.description}
                  </p>
                </article>
                {idx < PIPELINE_STEPS.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-slate-300 md:block" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-700">
          Modelos integrados
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {DETECTORES.map((d) => {
            const Icon = d.icon;
            return (
              <article
                key={d.nombre}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-card"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${d.bg} ${d.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      d.rol === 'Supervisado'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {d.rol}
                  </span>
                </div>
                <p className="text-base font-bold text-slate-900">{d.nombre}</p>
                <p className="mt-2 text-sm text-slate-600">{d.desc}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-700">
          Métricas destacadas
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
              <p className="mt-1 text-[10px] text-slate-400">{metric.sub}</p>
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
