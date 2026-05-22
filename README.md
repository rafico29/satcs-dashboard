# SATCS Dashboard 🚨

**Sistema de Alertas Tempranas en Contratación de Salud** — dashboard
interactivo de auditoría que combina detección multimodelo de anomalías
(Isolation Forest, LOF, MLP, modelo V2) sobre datos de contratación pública
del sector salud en Colombia.

El tablero permite a auditores y equipos de control:

- Filtrar contratos por departamento, tipo y score de riesgo.
- Visualizar la concentración geográfica de alertas (mapa de Colombia).
- Inspeccionar la distribución del score compuesto.
- Abrir cada contrato con su panel explicativo (factores y recomendación).

## Stack técnico

| Capa            | Tecnología                                |
| --------------- | ----------------------------------------- |
| Bundler         | [Vite](https://vitejs.dev) 5              |
| UI              | React 18 + TypeScript                     |
| Estilos         | Tailwind CSS                              |
| Gráficos        | Recharts                                  |
| Mapa            | React Leaflet + OpenStreetMap             |
| Parseo de datos | PapaParse (CSV)                           |
| Iconografía     | Lucide React                              |
| Hosting         | GitHub Pages (deploy estático automático) |

## Estructura del proyecto

```
dashboard/
├── .github/workflows/deploy.yml      # CI/CD a GitHub Pages
├── public/
│   └── data/
│       ├── top15.csv                 # Top 15 casos para auditoras
│       └── integrado.csv             # Dataset multimodelo (~9.5K filas)
├── src/
│   ├── main.tsx                      # Entry point
│   ├── App.tsx                       # Layout y estado global
│   ├── index.css                     # Tailwind directives
│   ├── types/index.ts                # ContratoTop15, ContratoIntegrado, FilterState
│   ├── data/loadData.ts              # Carga UTF-8 + parseo de CSV
│   └── components/
│       ├── Header.tsx                # Logo SATCS + estado en línea
│       ├── Filters.tsx               # Multi-select, slider, toggle
│       ├── KPIs.tsx                  # 4 KPIs principales
│       ├── ColombiaMap.tsx           # Choropleth por departamento
│       ├── ContractsTable.tsx        # Tabla ordenable + paginada
│       ├── ExplanationPanel.tsx      # Drawer con factores y recomendación
│       └── DistributionChart.tsx     # Histograma de score_compuesto
├── index.html
├── package.json
├── vite.config.ts                    # Base configurable para GitHub Pages
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── tsconfig.node.json
```

## Desarrollo local

Requisitos: **Node.js 20+** y **npm**.

```bash
cd dashboard
npm install
npm run dev
```

El servidor de Vite quedará disponible en `http://localhost:5173`.

Otros comandos útiles:

```bash
npm run build      # Compila a dist/
npm run preview    # Sirve dist/ localmente para verificar el build
npm run lint       # Verificación de tipos con tsc --noEmit
```

## Datos

Los CSV originales viven en `public/data/`:

- `top15.csv` — 15 casos prioritarios para auditoría manual.
- `integrado.csv` — dataset completo (~9.5K contratos) con 46 columnas que
  incluyen scores de cada modelo, banderas de anomalía y métricas
  contextuales por proveedor y departamento.

Si los datos cambian, basta con reemplazar los archivos en `public/data/`
manteniendo los mismos nombres y encabezados (con tildes y espacios).

## Despliegue a GitHub Pages

### 1. Ajusta la base URL al nombre de tu repositorio

Edita `vite.config.ts`:

```ts
base: process.env.NODE_ENV === 'production' ? '/<NOMBRE-DE-TU-REPO>/' : '/',
```

Por defecto el valor es `/satcs-dashboard/`. Si tu repositorio se llama
distinto (por ejemplo `alertas-tempranas-dashboard`), reemplázalo aquí.

### 2. Habilita GitHub Pages en tu repo

En **Settings → Pages**, selecciona como _Source_ la opción
**GitHub Actions**. El workflow `.github/workflows/deploy.yml` se encarga
del resto.

### 3. Push a `main`

```bash
git add dashboard
git commit -m "feat: SATCS dashboard interactivo"
git push origin main
```

El workflow:

1. Hace checkout del repo.
2. Instala Node.js 20 y dependencias dentro de `dashboard/`.
3. Ejecuta `npm run build`.
4. Sube `dashboard/dist` como artefacto de Pages.
5. Despliega automáticamente.

La URL final tendrá la forma:

```
https://<tu-usuario>.github.io/<NOMBRE-DE-TU-REPO>/
```

### Despliegue manual alternativo

Si prefieres desplegar a la rama `gh-pages` con
[`peaceiris/actions-gh-pages`](https://github.com/peaceiris/actions-gh-pages),
reemplaza el job `deploy` del workflow por:

```yaml
- uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./dashboard/dist
```

## Notas técnicas

- **Encoding UTF-8**: `loadData.ts` decodifica explícitamente con
  `TextDecoder('utf-8')` para preservar tildes y eñes.
- **GeoJSON**: el mapa carga el GeoJSON de departamentos de Colombia desde
  el [gist público de John Guerra](https://gist.githubusercontent.com/john-guerra/43c7656821069d00dcbc/raw/3aadedf47badbdac823b00dbe259f6bc6d9e1899/colombia.geo.json).
  Si tu entorno bloquea el dominio, puedes descargar el archivo a
  `public/data/colombia.geo.json` y ajustar `COLOMBIA_GEOJSON_URL`.
- **Performance**: el dataset integrado carga ~9.5K filas. El parseo y
  filtrado se hacen en memoria con `useMemo` para mantener el render
  reactivo.

---

Diseñado para auditores que necesitan ver mucha información rápido, sin
sacrificar contexto.
