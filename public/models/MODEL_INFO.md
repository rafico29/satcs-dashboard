# Modelos ONNX — SATCS Dashboard

Modelos entrenados y exportados desde `kmeans_RedNeuronal_SVM_Final.ipynb`
para inferencia en el navegador.

## Archivos

| Archivo | Tamaño | Descripción |
|---------|--------|-------------|
| `svm_rbf.onnx` | ~5 KB | SVM con kernel RBF |
| `mlp.onnx` | ~11 KB | Red Neuronal MLP (64→32) |
| `preprocessing.json` | <1 KB | Medias/desviaciones del StandardScaler + metadata |

## Features esperadas (orden importante)

1. `duracion_dias`
2. `precio_por_dia_log` = `log10(1 + precio_por_dia)`
3. `desviacion_precio_contextual_log` (pre-calculada)

## Pipeline de inferencia

```
CSV de entrada
   ↓
Calcular precio_por_dia (si falta) = precio_limpio / duracion_dias
   ↓
log10(1 + precio_por_dia)
   ↓
StandardScaler (usar mean/scale de preprocessing.json)
   ↓
ONNX Runtime → SVM RBF + MLP
   ↓
Score = (0.55 × MLP_prob) + (0.45 × SVM_prob)
   ↓
Clasificar: Alta (>0.5) | Media (>0.3) | Baja (>0.15) | Normal (<0.15)
```

## Métricas de validación (test set)

### SVM RBF
- Accuracy: 0.9912
- Precision: 0.5750
- Recall: 1.0000
- F1-Score: 0.7302
- AUC-ROC: 0.9999

### MLP
- Accuracy: 0.9964
- Precision: 1.0000
- Recall: 0.6957
- F1-Score: 0.8205
- AUC-ROC: 0.9994

## Cómo regenerar

```bash
python3 scripts/export_models_to_onnx.py
```
