/**
 * Tipos del módulo de predicción.
 */

/** Una fila del CSV ya normalizada con las features mínimas para inferencia. */
export interface PredictionInput {
  /** ID del contrato (para identificar resultado) */
  idProceso: string;
  /** Entidad contratante (opcional, para mostrar) */
  entidad?: string;
  /** Departamento (opcional) */
  departamento?: string;
  /** Precio en COP (precio_limpio) */
  precio: number;
  /** Duración en días */
  duracionDias: number;
  /** Precio por día (calculado o provisto) */
  precioPorDia: number;
  /** Desviación contextual log (precalculada o cero si no disponible) */
  desviacionContextualLog: number;
}

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

export interface PredictionResult extends PredictionInput {
  /** Probabilidad del MLP (0-1) */
  mlpProb: number;
  /** Probabilidad del SVM RBF (0-1) */
  svmProb: number;
  /** Score combinado: 0.55 * MLP + 0.45 * SVM */
  scoreCompuesto: number;
  /** Clasificación operativa */
  riskLevel: RiskLevel;
  /** Etiqueta legible */
  riskLabel: string;
}

export interface DetectedFormat {
  type: 'raw_secop' | 'prepared' | 'unknown';
  /** Columnas que sí se encontraron en el CSV */
  foundColumns: string[];
  /** Columnas que faltan (críticas) */
  missingColumns: string[];
  /** Total de filas detectadas */
  rowCount: number;
}

export interface PreprocessingMetadata {
  version: string;
  features: string[];
  feature_count: number;
  preprocessing: {
    scaler: 'StandardScaler';
    mean: number[];
    scale: number[];
  };
  thresholds: {
    critical: number;
    high: number;
    medium: number;
  };
  models: {
    svm_rbf: { file: string; metrics: Record<string, number> };
    mlp: { file: string; metrics: Record<string, number> };
  };
}
