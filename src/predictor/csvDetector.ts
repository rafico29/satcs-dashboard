/**
 * Detecta el formato del CSV cargado y mapea sus filas a PredictionInput.
 * Soporta dos formatos:
 *
 *  - "prepared": viene con las columnas ya calculadas
 *      precio_limpio, duracion_dias, precio_por_dia, precio_por_dia_log,
 *      desviacion_precio_contextual_log
 *
 *  - "raw_secop": viene del SECOP. Necesita normalización.
 *      Columnas de precio: "Valor del Contrato" o "Precio Base"
 *      Duración: "Duración del Contrato (Dias)" o columnas de fecha.
 */
import type { DetectedFormat, PredictionInput } from './types';

export const REQUIRED_PREPARED = [
  'precio_limpio',
  'duracion_dias',
  'desviacion_precio_contextual_log',
];

export const COMMON_RAW_SECOP_COLS = [
  'ID del Proceso',
  'Entidad',
  'Valor del Contrato',
  'Duración del Contrato (Dias)',
];

const ID_COLS_CANDIDATES = [
  'ID del Proceso',
  'id_proceso',
  'idProceso',
  'ID Proceso',
  'IDProceso',
  'ID',
];

const ENTIDAD_COLS = ['Entidad', 'entidad', 'Entidad Contratante', 'entidad_contratante'];
const DEPTO_COLS = ['Departamento Entidad', 'DEPTO_STD', 'Departamento', 'departamento'];
const PRECIO_COLS = [
  'precio_limpio',
  'precio',
  'Valor del Contrato',
  'Valor Total',
  'valor_contrato',
];
const DURACION_COLS = [
  'duracion_dias',
  'Duración del Contrato (Dias)',
  'Duración (Dias)',
  'duracion',
];
const PRECIO_DIA_COLS = ['precio_por_dia', 'precio_dia'];
const DESV_COLS = [
  'desviacion_precio_contextual_log',
  'desviacion_contextual_log',
  'desviacion_log',
];

function pickFirstAvailable(row: Record<string, unknown>, candidates: string[]): unknown {
  for (const key of candidates) {
    if (key in row && row[key] !== undefined && row[key] !== '') {
      return row[key];
    }
  }
  return undefined;
}

function parseNumber(value: unknown): number {
  if (value === null || value === undefined || value === '') return NaN;
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  const cleaned = String(value).trim().replace(/,/g, '').replace(/\$/g, '');
  if (cleaned === '' || cleaned.toLowerCase() === 'nan' || cleaned.toLowerCase() === 'null') {
    return NaN;
  }
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

function parseString(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

/**
 * Detecta el formato del CSV a partir de sus columnas.
 */
export function detectFormat(rows: Record<string, unknown>[]): DetectedFormat {
  if (rows.length === 0) {
    return {
      type: 'unknown',
      foundColumns: [],
      missingColumns: [],
      rowCount: 0,
    };
  }
  const sample = rows[0];
  const cols = Object.keys(sample);

  // ¿Tiene columnas del formato preparado?
  const preparedHits = REQUIRED_PREPARED.filter((c) => c in sample);
  const preparedRatio = preparedHits.length / REQUIRED_PREPARED.length;

  // ¿Tiene columnas crudas del SECOP?
  const rawHits = COMMON_RAW_SECOP_COLS.filter((c) => c in sample);
  const rawRatio = rawHits.length / COMMON_RAW_SECOP_COLS.length;

  if (preparedRatio >= 0.6) {
    const missing = REQUIRED_PREPARED.filter((c) => !(c in sample));
    return {
      type: 'prepared',
      foundColumns: cols,
      missingColumns: missing,
      rowCount: rows.length,
    };
  }
  if (rawRatio >= 0.5) {
    const missing = COMMON_RAW_SECOP_COLS.filter((c) => !(c in sample));
    return {
      type: 'raw_secop',
      foundColumns: cols,
      missingColumns: missing,
      rowCount: rows.length,
    };
  }
  return {
    type: 'unknown',
    foundColumns: cols,
    missingColumns: [...REQUIRED_PREPARED],
    rowCount: rows.length,
  };
}

/**
 * Convierte filas raw del CSV a PredictionInput[], aplicando autodetección.
 * Las filas inválidas se descartan silenciosamente.
 *
 * Si el CSV no trae `desviacion_precio_contextual_log`, se calcula in-memory
 * como log10(precio_por_dia / mediana_depto_tipo) usando los propios datos
 * del archivo. Esto es una aproximación razonable cuando el usuario no tiene
 * acceso a las medianas oficiales.
 */
export function rowsToPredictionInputs(
  rows: Record<string, unknown>[],
): { inputs: PredictionInput[]; skipped: number; desviacionCalculada: boolean } {
  const inputs: PredictionInput[] = [];
  let skipped = 0;
  let desviacionEnviada = false;

  // Estructura intermedia para calcular la desviación contextual si no viene
  type Intermediate = {
    idx: number;
    idProceso: string;
    entidad?: string;
    departamento?: string;
    tipoContrato: string;
    precio: number;
    duracionDias: number;
    precioPorDia: number;
    desvProvista?: number;
  };
  const intermediate: Intermediate[] = [];

  for (const row of rows) {
    const idValue = pickFirstAvailable(row, ID_COLS_CANDIDATES);
    const idProceso = parseString(idValue) || `row-${intermediate.length + 1}`;

    const precio = parseNumber(pickFirstAvailable(row, PRECIO_COLS));
    const duracionDias = parseNumber(pickFirstAvailable(row, DURACION_COLS));

    if (!Number.isFinite(precio) || precio <= 0) {
      skipped += 1;
      continue;
    }
    if (!Number.isFinite(duracionDias) || duracionDias <= 0) {
      skipped += 1;
      continue;
    }

    let precioPorDia = parseNumber(pickFirstAvailable(row, PRECIO_DIA_COLS));
    if (!Number.isFinite(precioPorDia) || precioPorDia <= 0) {
      precioPorDia = precio / duracionDias;
    }

    const desv = parseNumber(pickFirstAvailable(row, DESV_COLS));
    if (Number.isFinite(desv)) desviacionEnviada = true;

    const tipo =
      parseString(pickFirstAvailable(row, ['Tipo de Contrato', 'tipo_contrato'])) ||
      'GENERAL';

    intermediate.push({
      idx: intermediate.length,
      idProceso,
      entidad: parseString(pickFirstAvailable(row, ENTIDAD_COLS)) || undefined,
      departamento: parseString(pickFirstAvailable(row, DEPTO_COLS)) || undefined,
      tipoContrato: tipo,
      precio,
      duracionDias,
      precioPorDia,
      desvProvista: Number.isFinite(desv) ? desv : undefined,
    });
  }

  // Calcular desviación contextual si no viene en el CSV.
  // desviacion = log10(precio_por_dia) - log10(mediana_depto_tipo)
  // Cuando solo hay 1 contrato por grupo, la desviación queda en 0 (neutral).
  const desviacionCalculada = !desviacionEnviada && intermediate.length > 0;

  if (desviacionCalculada) {
    // Agrupar por (departamento, tipoContrato) y calcular mediana de precio_por_dia
    const groups = new Map<string, number[]>();
    for (const it of intermediate) {
      const key = `${it.departamento ?? 'NA'}__${it.tipoContrato}`;
      const arr = groups.get(key) ?? [];
      arr.push(it.precioPorDia);
      groups.set(key, arr);
    }
    const medianas = new Map<string, number>();
    for (const [k, arr] of groups.entries()) {
      const sorted = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const median =
        sorted.length % 2 === 0
          ? (sorted[mid - 1] + sorted[mid]) / 2
          : sorted[mid];
      medianas.set(k, median);
    }

    // Mediana global como fallback cuando solo hay 1 contrato en un grupo
    const allPrices = intermediate.map((i) => i.precioPorDia).sort((a, b) => a - b);
    const midAll = Math.floor(allPrices.length / 2);
    const medianaGlobal =
      allPrices.length % 2 === 0
        ? (allPrices[midAll - 1] + allPrices[midAll]) / 2
        : allPrices[midAll];

    for (const it of intermediate) {
      const key = `${it.departamento ?? 'NA'}__${it.tipoContrato}`;
      const arr = groups.get(key) ?? [];
      // Solo usar mediana del grupo si hay al menos 3 contratos; si no, fallback a global
      const med = arr.length >= 3 ? medianas.get(key)! : medianaGlobal;
      const desviacion = Math.log10((it.precioPorDia + 1) / (med + 1));
      it.desvProvista = desviacion;
    }
  }

  for (const it of intermediate) {
    inputs.push({
      idProceso: it.idProceso,
      entidad: it.entidad,
      departamento: it.departamento,
      precio: it.precio,
      duracionDias: it.duracionDias,
      precioPorDia: it.precioPorDia,
      desviacionContextualLog: it.desvProvista ?? 0,
    });
  }

  return { inputs, skipped, desviacionCalculada };
}

/**
 * Construye una plantilla CSV vacía con headers y dos filas de ejemplo.
 * Solo requiere: ID, valor del contrato y duración. Las demás columnas son
 * opcionales y se calculan automáticamente.
 */
export function buildCsvTemplate(): string {
  const headers = [
    'ID del Proceso',
    'Entidad',
    'Departamento Entidad',
    'Tipo de Contrato',
    'Valor del Contrato',
    'Duración del Contrato (Dias)',
  ];
  const rows = [
    [
      'CO1.REQ.EJEMPLO001',
      'HOSPITAL UNIVERSITARIO DE LA SAMARITANA',
      'Cundinamarca',
      'Prestación De Servicios',
      '90000000',
      '180',
    ],
    [
      'CO1.REQ.EJEMPLO002',
      'ESE HOSPITAL SAN VICENTE DE PAUL',
      'Antioquia',
      'Prestación De Servicios',
      '45000000',
      '180',
    ],
    [
      'CO1.REQ.EJEMPLO003',
      'SUBRED INTEGRADA DE SERVICIOS DE SALUD CENTRO ORIENTE',
      'Bogotá D.C.',
      'Decreto 092 De 2017',
      '150000000',
      '365',
    ],
  ];
  const help = [
    '# Plantilla SATCS — predicción de anomalías en contratos',
    '#',
    '# Columnas requeridas: ID, Valor del Contrato y Duración del Contrato (Dias)',
    '# Las demás son opcionales y se utilizan para mostrar contexto al auditor.',
    '#',
    '# El sistema calcula automáticamente:',
    '#   - precio_por_dia = Valor / Duración',
    '#   - desviación contextual: comparando con la mediana del depto. y tipo de contrato',
    '#',
  ].join('\n');
  return `${help}\n${headers.join(',')}\n${rows.map((r) => r.join(',')).join('\n')}\n`;
}
