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
 */
export function rowsToPredictionInputs(
  rows: Record<string, unknown>[],
): { inputs: PredictionInput[]; skipped: number } {
  const inputs: PredictionInput[] = [];
  let skipped = 0;

  for (const row of rows) {
    const idValue = pickFirstAvailable(row, ID_COLS_CANDIDATES);
    const idProceso = parseString(idValue) || `row-${inputs.length + 1}`;

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

    // precio_por_dia: usar el provisto o calcularlo
    let precioPorDia = parseNumber(pickFirstAvailable(row, PRECIO_DIA_COLS));
    if (!Number.isFinite(precioPorDia) || precioPorDia <= 0) {
      precioPorDia = precio / duracionDias;
    }

    // desviacion_contextual_log: si existe, usarla; si no, 0 (neutral)
    const desv = parseNumber(pickFirstAvailable(row, DESV_COLS));
    const desviacionContextualLog = Number.isFinite(desv) ? desv : 0;

    inputs.push({
      idProceso,
      entidad: parseString(pickFirstAvailable(row, ENTIDAD_COLS)) || undefined,
      departamento: parseString(pickFirstAvailable(row, DEPTO_COLS)) || undefined,
      precio,
      duracionDias,
      precioPorDia,
      desviacionContextualLog,
    });
  }

  return { inputs, skipped };
}

/**
 * Construye una plantilla CSV vacía con headers y una fila de ejemplo.
 */
export function buildCsvTemplate(): string {
  const headers = [
    'ID del Proceso',
    'Entidad',
    'Departamento Entidad',
    'precio_limpio',
    'duracion_dias',
    'precio_por_dia',
    'desviacion_precio_contextual_log',
  ];
  const example = [
    'CO1.REQ.EJEMPLO123',
    'HOSPITAL DE EJEMPLO',
    'Bogotá D.C.',
    '90000000',
    '180',
    '500000',
    '0',
  ];
  const help = [
    '# Plantilla SATCS — predicción de anomalías',
    '# precio_por_dia y desviacion_precio_contextual_log son opcionales:',
    '#   - precio_por_dia se calcula como precio_limpio / duracion_dias si falta',
    '#   - desviacion_precio_contextual_log se asume 0 (neutral) si falta',
    '#',
  ].join('\n');
  return `${help}\n${headers.join(',')}\n${example.join(',')}\n`;
}
