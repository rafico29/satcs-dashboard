import ScoreByDeptChart from '../components/charts/ScoreByDeptChart';
import ContractTypeChart from '../components/charts/ContractTypeChart';
import PriceVsDurationScatter from '../components/charts/PriceVsDurationScatter';
import TimelineChart from '../components/charts/TimelineChart';
import ModelAgreementChart from '../components/charts/ModelAgreementChart';
import RiskByTransparencyChart from '../components/charts/RiskByTransparencyChart';
import TopEntidadesChart from '../components/charts/TopEntidadesChart';
import TopProveedoresChart from '../components/charts/TopProveedoresChart';
import type { ContratoIntegrado } from '../types';

interface Props {
  data: ContratoIntegrado[];
}

export default function AnalyticsView({ data }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Análisis
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Análisis profundo del modelo
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Exploración detallada de los patrones detectados por los pipelines
          multimodelo: comportamiento por territorio, tipología contractual,
          consenso entre modelos y relación entre transparencia y riesgo.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ScoreByDeptChart data={data} />
        <ContractTypeChart data={data} />
        <PriceVsDurationScatter data={data} />
        <TimelineChart data={data} />
        <ModelAgreementChart data={data} />
        <RiskByTransparencyChart data={data} />
        <TopEntidadesChart data={data} />
        <TopProveedoresChart data={data} />
      </div>
    </div>
  );
}
