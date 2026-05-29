import type { ComponentType } from 'react';
import type { ContratoIntegrado } from '../../types';

import ScoreByDeptChart from '../charts/ScoreByDeptChart';
import ContractTypeChart from '../charts/ContractTypeChart';
import PriceVsDurationScatter from '../charts/PriceVsDurationScatter';
import TimelineChart from '../charts/TimelineChart';
import ModelAgreementChart from '../charts/ModelAgreementChart';
import RiskByTransparencyChart from '../charts/RiskByTransparencyChart';
import TopEntidadesChart from '../charts/TopEntidadesChart';
import TopProveedoresChart from '../charts/TopProveedoresChart';

// Tipo local para evitar incompatibilidades entre @types/react-grid-layout y la
// implementación instalada (las definiciones de @types están desactualizadas y
// los tipos de la lib v2 son confusos en algunos puntos).
export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
}

export interface ChartDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType<{ data: ContratoIntegrado[] }>;
  defaultW: number;
  defaultH: number;
  minW?: number;
  minH?: number;
}

// w: en columnas (12 cols totales). h: filas de 32px aprox.
// Tiles compactos: el grid usa 3 columnas por defecto (4 cols cada uno = 12 totales).
// Altura 5 filas → ~160px. Esto deja ver 6 charts en una pantalla 1080p.
export const CHART_DEFINITIONS: ChartDefinition[] = [
  {
    id: 'score-by-dept',
    title: 'Score por departamento',
    description: 'Riesgo medio por territorio',
    component: ScoreByDeptChart,
    defaultW: 4,
    defaultH: 5,
    minW: 3,
    minH: 4,
  },
  {
    id: 'contract-type',
    title: 'Tipos de contrato',
    description: 'Distribución de alertas por tipología',
    component: ContractTypeChart,
    defaultW: 4,
    defaultH: 5,
    minW: 3,
    minH: 4,
  },
  {
    id: 'price-vs-duration',
    title: 'Precio vs duración',
    description: 'Dispersión y outliers operativos',
    component: PriceVsDurationScatter,
    defaultW: 4,
    defaultH: 5,
    minW: 3,
    minH: 4,
  },
  {
    id: 'timeline',
    title: 'Línea de tiempo',
    description: 'Evolución mensual de alertas',
    component: TimelineChart,
    defaultW: 4,
    defaultH: 5,
    minW: 3,
    minH: 4,
  },
  {
    id: 'model-agreement',
    title: 'Acuerdo entre modelos',
    description: 'Coincidencias entre los detectores',
    component: ModelAgreementChart,
    defaultW: 4,
    defaultH: 5,
    minW: 3,
    minH: 4,
  },
  {
    id: 'risk-vs-transparency',
    title: 'Riesgo vs transparencia',
    description: 'Departamentos por nivel de transparencia',
    component: RiskByTransparencyChart,
    defaultW: 4,
    defaultH: 5,
    minW: 3,
    minH: 4,
  },
  {
    id: 'top-entidades',
    title: 'Top entidades',
    description: 'Entidades con más alertas',
    component: TopEntidadesChart,
    defaultW: 4,
    defaultH: 5,
    minW: 3,
    minH: 4,
  },
  {
    id: 'top-proveedores',
    title: 'Top proveedores',
    description: 'Proveedores con más alertas',
    component: TopProveedoresChart,
    defaultW: 4,
    defaultH: 5,
    minW: 3,
    minH: 4,
  },
];

export function buildDefaultLayout(visibleIds: string[]): LayoutItem[] {
  // Layout en grilla de 3 columnas (4 unidades cada una en grid de 12)
  const COLS_PER_ROW = 3;
  const ITEM_W = 4;
  return visibleIds.map((id, idx): LayoutItem => {
    const def = CHART_DEFINITIONS.find((c) => c.id === id);
    const w = def?.defaultW ?? ITEM_W;
    const h = def?.defaultH ?? 5;
    return {
      i: id,
      x: (idx % COLS_PER_ROW) * w,
      y: Math.floor(idx / COLS_PER_ROW) * h,
      w,
      h,
      minW: def?.minW,
      minH: def?.minH,
    };
  });
}
