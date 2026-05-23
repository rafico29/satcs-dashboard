import Papa from 'papaparse';
import type { ContratoIntegrado, ContratoTop15 } from '../types';

// Vite expone import.meta.env.BASE_URL con la base configurada en vite.config.ts
// (necesario para que las rutas funcionen en GitHub Pages bajo un sub-path).
const BASE = import.meta.env.BASE_URL;

const toNumber = (value: unknown): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const cleaned = String(value).trim().replace(/,/g, '');
  if (cleaned === '' || cleaned.toLowerCase() === 'nan') return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
};

const toString = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

async function fetchCsv<T>(path: string): Promise<T[]> {
  const url = `${BASE}${path}`.replace(/\/+/g, '/');
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${url}: ${response.status} ${response.statusText}`);
  }
  // Forzamos UTF-8 para preservar tildes y caracteres especiales.
  const buffer = await response.arrayBuffer();
  const text = new TextDecoder('utf-8').decode(buffer);
  return new Promise<T[]>((resolve, reject) => {
    Papa.parse<T>(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => resolve(results.data as T[]),
      error: (err: unknown) => reject(err),
    });
  });
}

export async function loadTop15(): Promise<ContratoTop15[]> {
  const rows = await fetchCsv<Record<string, string>>('data/top15.csv');
  return rows
    .filter((r) => toString(r['Caso #']) !== '')
    .map((r) => ({
      caso: toNumber(r['Caso #']),
      idProceso: toString(r['ID Proceso SECOP']),
      entidad: toString(r['Entidad Contratante']),
      departamento: toString(r['Departamento']),
      tipoContrato: toString(r['Tipo de Contrato']),
      valor: toNumber(r['Valor del Contrato (COP)']),
      duracion: toNumber(r['Duracion (dias)']),
      proveedor: toString(r['Proveedor']),
      scoreRiesgo: toNumber(r['Score de Riesgo (0-1)']),
      analisisDetectan: toNumber(r['Analisis que lo detectan (de 3)']),
      analisisA: toNumber(r['Analisis A (%)']),
      analisisB: toNumber(r['Analisis B (%)']),
      analisisC: toNumber(r['Analisis C (%)']),
    }));
}

export async function loadIntegrado(): Promise<ContratoIntegrado[]> {
  const rows = await fetchCsv<Record<string, string>>('data/integrado.csv');
  return rows
    .filter((r) => toString(r['ID del Proceso']) !== '')
    .map((r) => ({
      idProceso: toString(r['ID del Proceso']),
      entidad: toString(r['Entidad']),
      nitEntidad: toString(r['Nit Entidad']),
      proveedor: toString(r['Nombre del Proveedor Adjudicado']),
      nitProveedor: toString(r['NIT del Proveedor Adjudicado']),
      departamento: toString(r['Departamento Entidad']),
      ciudad: toString(r['Ciudad Entidad']),
      tipoContrato: toString(r['Tipo de Contrato']),
      descripcion: toString(r['Descripción del Procedimiento']),
      precio: toNumber(r['precio_limpio']),
      duracionDias: toNumber(r['duracion_dias']),
      precioPorDia: toNumber(r['precio_por_dia']),
      idf: toNumber(r['IDF_NUEVO']),
      ita: toNumber(r['ITA_NUEVO']),
      riesgoFiscal: toNumber(r['RIESGO_FISCAL']),
      nivelTransparencia: toString(r['NIVEL_TRANSPARENCIA_V2']),
      scoreCompuesto: toNumber(r['score_compuesto']),
      nPipelinesAnomalo: toNumber(r['n_pipelines_anomalo']),
      labelConsenso: toNumber(r['label_consenso']),
      iforestAnomalia: toNumber(r['iforest_anomalia']),
      anomaliaV2: toNumber(r['anomalia_v2']),
      lofAnomalia: toNumber(r['lof_anomalia']),
      mlpAnomalia: toNumber(r['mlp_anomalia']),
      probAnomaliaV2: toNumber(r['prob_anomalia_v2']),
      mlpProbAnomalia: toNumber(r['mlp_prob_anomalia']),
      svmRbfProb: toNumber(r['svm_rbf_prob']),
      svmRbfAnomalia: toNumber(r['svm_rbf_anomalia']),
      anioProceso: toNumber(r['ANIO_PROCESO']),
      fechaPublicacion: toString(r['fecha_publicacion']),
    }));
}

// URL pública del GeoJSON de departamentos de Colombia.
export const COLOMBIA_GEOJSON_URL =
  'https://gist.githubusercontent.com/john-guerra/43c7656821069d00dcbc/raw/3aadedf47badbdac823b00dbe259f6bc6d9e1899/colombia.geo.json';

export async function loadColombiaGeoJson(): Promise<unknown> {
  const res = await fetch(COLOMBIA_GEOJSON_URL);
  if (!res.ok) throw new Error('No se pudo cargar el GeoJSON de Colombia');
  return res.json();
}

// Formato monetario colombiano (COP, sin decimales).
export const formatCOP = (value: number): string => {
  if (!Number.isFinite(value)) return '$0';
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `$${Math.round(value).toLocaleString('es-CO')}`;
  }
};

export const formatNumber = (value: number, digits = 0): string => {
  if (!Number.isFinite(value)) return '0';
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
};
