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
  iforestAnomalia: number;
  anomaliaV2: number;
  lofAnomalia: number;
  mlpAnomalia: number;
  probAnomaliaV2: number;
  mlpProbAnomalia: number;
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
