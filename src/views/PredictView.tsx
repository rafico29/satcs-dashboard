import { useCallback, useMemo, useRef, useState } from 'react';
import Papa from 'papaparse';
import {
  Upload,
  FileText,
  Download,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  X,
  Brain,
  Sparkles,
} from 'lucide-react';

import {
  buildCsvTemplate,
  detectFormat,
  rowsToPredictionInputs,
} from '../predictor/csvDetector';
import { predict, getRiskColor } from '../predictor/inference';
import type {
  DetectedFormat,
  PredictionInput,
  PredictionResult,
} from '../predictor/types';

interface UploadState {
  fileName: string;
  rows: Record<string, unknown>[];
  format: DetectedFormat;
  inputs: PredictionInput[];
  skipped: number;
}

function formatCOP(v: number): string {
  if (!Number.isFinite(v)) return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(v);
}

function formatNumber(v: number): string {
  if (!Number.isFinite(v)) return '0';
  return new Intl.NumberFormat('es-CO').format(Math.round(v));
}

export default function PredictView() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [upload, setUpload] = useState<UploadState | null>(null);
  const [results, setResults] = useState<PredictionResult[] | null>(null);
  const [progress, setProgress] = useState<{ stage: string; pct: number } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const handleFile = useCallback((file: File) => {
    setError(null);
    setResults(null);
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      comments: '#',
      complete: (parsed) => {
        if (parsed.errors.length > 0) {
          // Ignoramos errores menores (filas en blanco)
          const fatal = parsed.errors.filter((e) => e.type !== 'Delimiter');
          if (fatal.length > 0 && parsed.data.length === 0) {
            setError(`Error al parsear el CSV: ${fatal[0].message}`);
            return;
          }
        }
        const rows = parsed.data;
        if (!Array.isArray(rows) || rows.length === 0) {
          setError('El CSV está vacío o tiene formato inválido.');
          return;
        }
        const format = detectFormat(rows);
        const { inputs, skipped } = rowsToPredictionInputs(rows);
        if (inputs.length === 0) {
          setError(
            'No se pudo extraer ningún registro válido del CSV. Verifica que tenga columnas de precio y duración.',
          );
          return;
        }
        setUpload({ fileName: file.name, rows, format, inputs, skipped });
      },
      error: (err) => setError(`Error al leer el archivo: ${err.message}`),
    });
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const onSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleRun = async () => {
    if (!upload) return;
    setRunning(true);
    setError(null);
    setResults(null);
    try {
      const out = await predict(upload.inputs, (stage, pct) =>
        setProgress({ stage, pct }),
      );
      setResults(out);
    } catch (err: any) {
      setError(`Error en la inferencia: ${err.message ?? err}`);
    } finally {
      setRunning(false);
      setProgress(null);
    }
  };

  const handleClear = () => {
    setUpload(null);
    setResults(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadResults = () => {
    if (!results) return;
    const cols = [
      'idProceso',
      'entidad',
      'departamento',
      'precio',
      'duracionDias',
      'precioPorDia',
      'mlpProb',
      'svmProb',
      'scoreCompuesto',
      'riskLevel',
      'riskLabel',
    ] as const;
    const header = cols.join(',');
    const rows = results.map((r) =>
      cols
        .map((c) => {
          const v = r[c];
          if (typeof v === 'string') {
            const esc = v.replace(/"/g, '""');
            return /[",\n]/.test(v) ? `"${esc}"` : esc;
          }
          if (typeof v === 'number') return v.toFixed(6);
          return '';
        })
        .join(','),
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `satcs-predicciones-${results.length}.csv`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = () => {
    const csv = buildCsvTemplate();
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'satcs-plantilla.csv';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const summary = useMemo(() => {
    if (!results) return null;
    const acc = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const r of results) acc[r.riskLevel]++;
    return acc;
  }, [results]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Predicción
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Analizar contratos desde CSV
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          Sube un CSV con contratos del SECOP-Salud y los modelos del SATCS
          (MLP + SVM RBF) calcularán la probabilidad de anomalía para cada uno
          en tu navegador. Los datos no salen de tu equipo.
        </p>
      </header>

      {/* Paso 1 — Upload */}
      {!upload && (
        <section className="flex flex-col gap-4">
          <label
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            htmlFor="csv-upload"
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center transition hover:border-accent hover:bg-accent/5"
          >
            <Upload className="mb-3 h-12 w-12 text-slate-400" />
            <p className="text-base font-semibold text-slate-700">
              Arrastra tu CSV aquí o haz clic para seleccionar
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Formatos soportados: CSV crudo del SECOP o ya preparado con las
              columnas calculadas
            </p>
            <input
              ref={fileInputRef}
              id="csv-upload"
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={onSelect}
            />
          </label>

          <div className="flex items-center justify-center gap-3 text-xs">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" />
              Descargar plantilla CSV
            </button>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">
              Mínimo: <code className="rounded bg-slate-100 px-1">precio_limpio</code>{' '}
              y <code className="rounded bg-slate-100 px-1">duracion_dias</code>
            </span>
          </div>
        </section>
      )}

      {/* Paso 2 — Vista previa y confirmación */}
      {upload && !results && (
        <section className="space-y-4">
          {/* Banner del archivo */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-card">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-accent" />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {upload.fileName}
                </p>
                <p className="text-xs text-slate-500">
                  {formatNumber(upload.inputs.length)} contratos válidos
                  {upload.skipped > 0 && ` · ${upload.skipped} omitidos`}
                </p>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              aria-label="Quitar archivo"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Detección de formato */}
          <div
            className={`rounded-xl border p-4 ${
              upload.format.type === 'unknown'
                ? 'border-amber-200 bg-amber-50'
                : 'border-emerald-200 bg-emerald-50'
            }`}
          >
            <div className="flex items-start gap-3">
              {upload.format.type === 'unknown' ? (
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              ) : (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              )}
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  {upload.format.type === 'prepared' &&
                    'Formato detectado: CSV preparado'}
                  {upload.format.type === 'raw_secop' &&
                    'Formato detectado: CSV crudo del SECOP'}
                  {upload.format.type === 'unknown' &&
                    'Formato no estándar detectado'}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  {upload.format.type === 'prepared' &&
                    'El CSV ya tiene las columnas precalculadas. Listo para inferencia.'}
                  {upload.format.type === 'raw_secop' &&
                    'Se aplicará la limpieza automática: cálculo de precio_por_dia y normalización.'}
                  {upload.format.type === 'unknown' &&
                    'No se reconocen las columnas del SECOP, pero igual se procesarán las filas con precio y duración válidos. El resultado puede ser menos preciso si falta la desviación contextual.'}
                </p>
                {upload.skipped > 0 && (
                  <p className="mt-2 text-xs text-amber-700">
                    Se omitieron {upload.skipped} filas con datos inválidos
                    (precio o duración faltantes/cero).
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Vista previa de las primeras 5 filas */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
            <div className="border-b border-slate-200 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                Vista previa (primeras 5 filas)
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">ID</th>
                    <th className="px-3 py-2 text-left font-semibold">Entidad</th>
                    <th className="px-3 py-2 text-right font-semibold">Valor</th>
                    <th className="px-3 py-2 text-right font-semibold">
                      Duración
                    </th>
                    <th className="px-3 py-2 text-right font-semibold">
                      $/día
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {upload.inputs.slice(0, 5).map((r) => (
                    <tr key={r.idProceso}>
                      <td className="px-3 py-2 font-mono text-slate-700">
                        {r.idProceso.length > 30
                          ? r.idProceso.slice(0, 30) + '…'
                          : r.idProceso}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {r.entidad ? (r.entidad.length > 40 ? r.entidad.slice(0, 40) + '…' : r.entidad) : '—'}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {formatCOP(r.precio)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {formatNumber(r.duracionDias)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {formatCOP(r.precioPorDia)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Botón ejecutar */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleClear}
              className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              disabled={running}
            >
              Cancelar
            </button>
            <button
              onClick={handleRun}
              disabled={running}
              className="flex items-center gap-2 rounded-md bg-accent px-5 py-2 text-sm font-semibold text-white shadow hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {running ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Predecir {formatNumber(upload.inputs.length)} contratos
                </>
              )}
            </button>
          </div>

          {/* Progreso */}
          {progress && (
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-card">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  {progress.stage}
                </span>
                <span className="tabular-nums text-slate-500">
                  {(progress.pct * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full bg-accent transition-all"
                  style={{ width: `${progress.pct * 100}%` }}
                />
              </div>
            </div>
          )}
        </section>
      )}

      {/* Paso 3 — Resultados */}
      {results && summary && (
        <section className="space-y-4">
          {/* KPIs por categoría */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                Crítica
              </p>
              <p className="mt-1 text-2xl font-bold text-red-700">
                {summary.critical}
              </p>
              <p className="text-[11px] text-red-600">score &gt; 0.5</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                Alta
              </p>
              <p className="mt-1 text-2xl font-bold text-amber-700">
                {summary.high}
              </p>
              <p className="text-[11px] text-amber-600">score &gt; 0.3</p>
            </div>
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-yellow-700">
                Media
              </p>
              <p className="mt-1 text-2xl font-bold text-yellow-700">
                {summary.medium}
              </p>
              <p className="text-[11px] text-yellow-600">score &gt; 0.15</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Sin alerta
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-700">
                {summary.low}
              </p>
              <p className="text-[11px] text-emerald-600">score ≤ 0.15</p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              <strong>{formatNumber(results.length)}</strong> contratos
              analizados con MLP + SVM RBF
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadResults}
                className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Download className="h-4 w-4" />
                Exportar resultados
              </button>
              <button
                onClick={handleClear}
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Nuevo análisis
              </button>
            </div>
          </div>

          {/* Tabla de resultados */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-600">
                      Riesgo
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-600">
                      ID
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-600">
                      Entidad
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-600">
                      Valor
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-600">
                      Duración
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-600">
                      MLP
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-600">
                      SVM
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-600">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results
                    .slice()
                    .sort((a, b) => b.scoreCompuesto - a.scoreCompuesto)
                    .slice(0, 100)
                    .map((r) => (
                      <tr key={r.idProceso} className="hover:bg-slate-50">
                        <td className="px-3 py-2">
                          <span
                            className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getRiskColor(
                              r.riskLevel,
                            )}`}
                          >
                            {r.riskLabel}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-slate-700">
                          {r.idProceso.length > 25
                            ? r.idProceso.slice(0, 25) + '…'
                            : r.idProceso}
                        </td>
                        <td className="max-w-xs truncate px-3 py-2 text-slate-700">
                          {r.entidad ?? '—'}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-slate-700">
                          {formatCOP(r.precio)}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-slate-700">
                          {formatNumber(r.duracionDias)}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-slate-600">
                          {(r.mlpProb * 100).toFixed(1)}%
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-slate-600">
                          {(r.svmProb * 100).toFixed(1)}%
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-semibold tabular-nums text-slate-900">
                          {r.scoreCompuesto.toFixed(3)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {results.length > 100 && (
              <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-center text-xs text-slate-500">
                Mostrando los 100 con mayor score. Exporta el CSV para ver
                todos los {formatNumber(results.length)}.
              </div>
            )}
          </div>

          {/* Modelo info */}
          <div className="flex items-center justify-center gap-4 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-500">
            <Brain className="h-4 w-4 text-accent" />
            <span>
              Modelos ejecutados localmente con ONNX Runtime. Score = 0.55 × MLP
              + 0.45 × SVM RBF.
            </span>
          </div>
        </section>
      )}

      {/* Errores */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">No se pudo procesar el archivo.</p>
          <p className="mt-1 text-xs">{error}</p>
        </div>
      )}
    </div>
  );
}
