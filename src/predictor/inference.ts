/**
 * Carga los modelos ONNX y ejecuta inferencia sobre PredictionInput[].
 * El motor de inferencia es onnxruntime-web cargado dinámicamente desde un CDN
 * para mantener el bundle de la app pequeño.
 */
import type {
  PredictionInput,
  PredictionResult,
  PreprocessingMetadata,
  RiskLevel,
} from './types';

const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');
const MODEL_PATHS = {
  metadata: `${BASE}/models/preprocessing.json`,
  svm: `${BASE}/models/svm_rbf.onnx`,
  mlp: `${BASE}/models/mlp.onnx`,
};

const ORT_VERSION = '1.20.1';
const ORT_CDN_BASE = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/`;
const ORT_SCRIPT_URL = `${ORT_CDN_BASE}ort.min.js`;

const WEIGHT_MLP = 0.55;
const WEIGHT_SVM = 0.45;

let cachedMetadata: PreprocessingMetadata | null = null;
let cachedSvmSession: any = null;
let cachedMlpSession: any = null;
let ortPromise: Promise<any> | null = null;

declare global {
  interface Window {
    ort?: any;
  }
}

/**
 * Carga onnxruntime-web desde CDN usando un script tag.
 * Esto evita que vite intente empaquetar los WASM (que pesan ~26 MB).
 */
async function loadOrt(): Promise<any> {
  if (ortPromise) return ortPromise;
  ortPromise = new Promise((resolve, reject) => {
    if (window.ort) {
      configureOrt(window.ort);
      resolve(window.ort);
      return;
    }
    const script = document.createElement('script');
    script.src = ORT_SCRIPT_URL;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      const ort = window.ort;
      if (!ort) {
        reject(new Error('onnxruntime-web no se inicializó correctamente'));
        return;
      }
      configureOrt(ort);
      resolve(ort);
    };
    script.onerror = () => {
      reject(new Error(`No se pudo cargar onnxruntime-web desde ${ORT_SCRIPT_URL}`));
    };
    document.head.appendChild(script);
  });
  return ortPromise;
}

function configureOrt(ort: any) {
  if (ort?.env?.wasm) {
    ort.env.wasm.wasmPaths = ORT_CDN_BASE;
    ort.env.wasm.numThreads = 1;
    ort.env.wasm.simd = true;
  }
}

export async function loadMetadata(): Promise<PreprocessingMetadata> {
  if (cachedMetadata) return cachedMetadata;
  const response = await fetch(MODEL_PATHS.metadata);
  if (!response.ok) {
    throw new Error(`No se pudo cargar metadata: ${response.statusText}`);
  }
  cachedMetadata = (await response.json()) as PreprocessingMetadata;
  return cachedMetadata;
}

export async function loadModels() {
  const metadata = await loadMetadata();
  const ort = await loadOrt();

  if (!cachedSvmSession) {
    cachedSvmSession = await ort.InferenceSession.create(MODEL_PATHS.svm);
  }
  if (!cachedMlpSession) {
    cachedMlpSession = await ort.InferenceSession.create(MODEL_PATHS.mlp);
  }

  return {
    metadata,
    svmSession: cachedSvmSession,
    mlpSession: cachedMlpSession,
    ort,
  };
}

/**
 * Aplica el StandardScaler usando media/desviación del metadata.
 * Devuelve un Float32Array con shape [n, 3] flattened.
 */
function buildFeatureMatrix(
  inputs: PredictionInput[],
  metadata: PreprocessingMetadata,
): Float32Array {
  const n = inputs.length;
  const dims = metadata.feature_count;
  const matrix = new Float32Array(n * dims);
  const { mean, scale } = metadata.preprocessing;

  for (let i = 0; i < n; i++) {
    const inp = inputs[i];
    const precioPorDiaLog = Math.log10(1 + Math.max(0, inp.precioPorDia));
    const raw = [inp.duracionDias, precioPorDiaLog, inp.desviacionContextualLog];
    for (let j = 0; j < dims; j++) {
      const scaled = (raw[j] - mean[j]) / scale[j];
      matrix[i * dims + j] = scaled;
    }
  }
  return matrix;
}

/**
 * Extrae la probabilidad de la clase 1 (anómala) desde la salida ONNX.
 */
function extractAnomalyProbabilities(
  outputs: Record<string, any>,
): Float32Array {
  const probKey = Object.keys(outputs).find(
    (k) =>
      k.toLowerCase().includes('prob') ||
      k.toLowerCase().includes('output_probability'),
  );
  if (!probKey) {
    throw new Error('No se encontró output de probabilidades en el modelo ONNX');
  }
  const probTensor = outputs[probKey];
  const data = probTensor.data as Float32Array;
  const dims = probTensor.dims;
  const n = dims[0];
  const cls = dims[1];
  const result = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    result[i] = data[i * cls + 1];
  }
  return result;
}

function classify(score: number, thresholds: PreprocessingMetadata['thresholds']): RiskLevel {
  if (score > thresholds.critical) return 'critical';
  if (score > thresholds.high) return 'high';
  if (score > thresholds.medium) return 'medium';
  return 'low';
}

const RISK_LABELS: Record<RiskLevel, string> = {
  critical: 'Alerta crítica',
  high: 'Alerta alta',
  medium: 'Alerta media',
  low: 'Sin alerta',
};

/**
 * Ejecuta predicciones para todos los inputs usando MLP + SVM RBF.
 */
export async function predict(
  inputs: PredictionInput[],
  onProgress?: (stage: string, pct: number) => void,
): Promise<PredictionResult[]> {
  if (inputs.length === 0) return [];

  onProgress?.('Cargando motor de inferencia…', 0.05);
  const { metadata, svmSession, mlpSession, ort } = await loadModels();

  onProgress?.('Preparando features…', 0.2);
  const matrix = buildFeatureMatrix(inputs, metadata);
  const tensor = new ort.Tensor('float32', matrix, [
    inputs.length,
    metadata.feature_count,
  ]);

  onProgress?.('Ejecutando MLP…', 0.4);
  const mlpInputName = mlpSession.inputNames[0];
  const mlpOut = await mlpSession.run({ [mlpInputName]: tensor });
  const mlpProbs = extractAnomalyProbabilities(mlpOut);

  onProgress?.('Ejecutando SVM RBF…', 0.7);
  const svmInputName = svmSession.inputNames[0];
  const svmOut = await svmSession.run({ [svmInputName]: tensor });
  const svmProbs = extractAnomalyProbabilities(svmOut);

  onProgress?.('Calculando scores…', 0.9);
  const results: PredictionResult[] = inputs.map((inp, i) => {
    const mlp = mlpProbs[i];
    const svm = svmProbs[i];
    const score = WEIGHT_MLP * mlp + WEIGHT_SVM * svm;
    const level = classify(score, metadata.thresholds);
    return {
      ...inp,
      mlpProb: mlp,
      svmProb: svm,
      scoreCompuesto: score,
      riskLevel: level,
      riskLabel: RISK_LABELS[level],
    };
  });

  onProgress?.('Listo', 1);
  return results;
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'critical':
      return 'text-red-700 bg-red-100 border-red-200';
    case 'high':
      return 'text-amber-700 bg-amber-100 border-amber-200';
    case 'medium':
      return 'text-yellow-700 bg-yellow-100 border-yellow-200';
    case 'low':
      return 'text-emerald-700 bg-emerald-100 border-emerald-200';
  }
}
