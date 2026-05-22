import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import type { Feature, FeatureCollection, GeoJsonObject } from 'geojson';
import type { Layer, PathOptions } from 'leaflet';
import L from 'leaflet';
import { COLOMBIA_GEOJSON_URL } from '../data/loadData';
import type { ContratoIntegrado, DepartamentoStats } from '../types';

interface Props {
  data: ContratoIntegrado[];
  selected: string | null;
  onSelect: (departamento: string | null) => void;
}

// Normaliza nombres para emparejar departamentos del CSV con los del GeoJSON.
const normalize = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\bdepartamento\b/g, '')
    .replace(/\bd\.c\.?\b/g, '')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

function getColor(alertas: number, max: number): string {
  if (max <= 0 || alertas <= 0) return '#e2e8f0';
  const ratio = alertas / max;
  // Escala secuencial blanco → rojo
  if (ratio > 0.8) return '#7f1d1d';
  if (ratio > 0.6) return '#b91c1c';
  if (ratio > 0.4) return '#dc2626';
  if (ratio > 0.25) return '#f87171';
  if (ratio > 0.1) return '#fca5a5';
  return '#fee2e2';
}

function FitBounds({ geojson }: { geojson: GeoJsonObject | null }) {
  const map = useMap();
  useEffect(() => {
    if (!geojson) return;
    const layer = L.geoJSON(geojson);
    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [10, 10] });
    }
  }, [geojson, map]);
  return null;
}

export default function ColombiaMap({ data, selected, onSelect }: Props) {
  const [geojson, setGeojson] = useState<FeatureCollection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const layerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(COLOMBIA_GEOJSON_URL)
      .then((r) => {
        if (!r.ok) throw new Error('GeoJSON no disponible');
        return r.json();
      })
      .then((json) => {
        if (!cancelled) setGeojson(json as FeatureCollection);
      })
      .catch((e) => !cancelled && setError(String(e)));
    return () => {
      cancelled = true;
    };
  }, []);

  const statsByDepto = useMemo(() => {
    const map = new Map<string, DepartamentoStats>();
    data.forEach((d) => {
      const key = normalize(d.departamento);
      if (!key) return;
      const prev = map.get(key) ?? {
        nombre: d.departamento,
        total: 0,
        alertas: 0,
        riesgoAlto: 0,
        scoreMedio: 0,
      };
      prev.total += 1;
      if (d.labelConsenso === 1 || d.scoreCompuesto > 0.5) prev.alertas += 1;
      if (d.scoreCompuesto > 0.7) prev.riesgoAlto += 1;
      prev.scoreMedio += d.scoreCompuesto;
      map.set(key, prev);
    });
    map.forEach((v) => {
      v.scoreMedio = v.total > 0 ? v.scoreMedio / v.total : 0;
    });
    return map;
  }, [data]);

  const maxAlertas = useMemo(() => {
    let max = 0;
    statsByDepto.forEach((v) => {
      if (v.alertas > max) max = v.alertas;
    });
    return max;
  }, [statsByDepto]);

  const styleFn = (feature?: Feature): PathOptions => {
    const name = String(feature?.properties?.NOMBRE_DPT ?? '');
    const key = normalize(name);
    const stats = statsByDepto.get(key);
    const isSelected = selected && normalize(selected) === key;
    return {
      fillColor: getColor(stats?.alertas ?? 0, maxAlertas),
      weight: isSelected ? 2.5 : 0.8,
      color: isSelected ? '#0f172a' : '#94a3b8',
      fillOpacity: 0.85,
    };
  };

  const onEachFeature = (feature: Feature, layer: Layer) => {
    const name = String(feature.properties?.NOMBRE_DPT ?? 'Sin nombre');
    const key = normalize(name);
    const stats = statsByDepto.get(key);
    const html = `
      <div style="font-family: Inter, sans-serif; font-size: 12px; min-width: 160px;">
        <div style="font-weight: 600; color: #0f172a; margin-bottom: 4px;">${name}</div>
        <div style="color:#475569;">Contratos: <strong>${stats?.total ?? 0}</strong></div>
        <div style="color:#475569;">Alertas: <strong style="color:#dc2626;">${stats?.alertas ?? 0}</strong></div>
        <div style="color:#475569;">Riesgo alto: <strong>${stats?.riesgoAlto ?? 0}</strong></div>
      </div>
    `;
    layer.bindTooltip(html, { sticky: true, direction: 'top' });
    layer.on({
      click: () => {
        onSelect(stats?.nombre ?? name);
      },
      mouseover: (e) => {
        const target = e.target as L.Path;
        target.setStyle({ weight: 2, color: '#0f172a' });
        target.bringToFront();
      },
      mouseout: () => {
        layerRef.current?.resetStyle(layer as L.Path);
      },
    });
  };

  return (
    <section className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Mapa de alertas por departamento
        </h2>
        {selected && (
          <button
            onClick={() => onSelect(null)}
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
          >
            Quitar filtro: {selected}
          </button>
        )}
      </div>
      <div className="relative h-[520px] w-full overflow-hidden rounded-lg border border-slate-200">
        {error ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            No se pudo cargar el mapa: {error}
          </div>
        ) : (
          <MapContainer
            center={[4.5, -74]}
            zoom={5}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              opacity={0.4}
            />
            {geojson && (
              <GeoJSON
                data={geojson}
                style={styleFn}
                onEachFeature={onEachFeature}
                ref={(layer) => {
                  layerRef.current = (layer as unknown as L.GeoJSON) ?? null;
                }}
              />
            )}
            <FitBounds geojson={geojson} />
          </MapContainer>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span className="font-semibold text-slate-600">Alertas por depto:</span>
        {[
          ['#fee2e2', '0'],
          ['#fca5a5', 'Bajo'],
          ['#f87171', 'Medio'],
          ['#dc2626', 'Alto'],
          ['#7f1d1d', 'Crítico'],
        ].map(([color, label]) => (
          <span key={label} className="flex items-center gap-1">
            <span
              className="inline-block h-3 w-4 rounded border border-slate-200"
              style={{ background: color }}
            />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}
