// Tipos correspondientes a las columnas EXACTAS de los CSV de origen.
// Las claves preservan tildes y espacios tal como vienen del CSV original.

export interface ContratoTop15 {
  caso: number;
  idProceso: string;
  entidad: string;
  departamento: string;
  tipoContrato: string;
  valor: number;
  duracion: number;
  proveedor: string;
  scoreRiesgo: number;
  analisisDetectan: number;
  analisisA: number;
  analisisB: number;
  analisisC: number;
}

export interface ContratoIntegrado {
  idProceso: string;
  entidad: string;
  nitEntidad: string;
  proveedor: string;
  nitProveedor: string;
  departamento: string;
  ciudad: string;
  tipoContrato: string;
  descripcion: string;
  precio: number;
  duracionDias: number;
  precioPorDia: number;
  idf: number;
  ita: number;
  riesgoFiscal: number;
  nivelTransparencia: string;
  scoreCompuesto: number;
  nPipelinesAnomalo: number;
  labelConsenso: number;
  // Detectores binarios
  kmeansAnomalia: number; // es_anomalia
  iforestAnomalia: number;
  gmmAnomalia: number; // derivado de log_prob
  lofAnomalia: number;
  mlpAnomalia: number;
  svmRbfAnomalia: number;
  anomaliaV2: number;
  // Probabilidades / scores continuos
  mlpProbAnomalia: number;
  svmRbfProb: number;
  probAnomaliaV2: number;
  logProb: number;
  // Metadatos
  anioProceso: number;
  fechaPublicacion: string;
}

export interface FilterState {
  departamentos: string[];
  tiposContrato: string[];
  scoreMin: number;
  scoreMax: number;
  soloAlertas: boolean;
  busqueda: string;
  anios: number[];
}

export interface DepartamentoStats {
  nombre: string;
  total: number;
  alertas: number;
  riesgoAlto: number;
  scoreMedio: number;
}
