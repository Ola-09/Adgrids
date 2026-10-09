import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Eye, Navigation, Radio } from 'lucide-react';

export interface MapPin {
  id: string;
  name: string;
  x: number;
  y: number;
  status: 'live' | 'audit' | 'alert' | 'mounting' | 'crew';
  code: string;
  type?: string;
  client?: string;
  info?: string;
  lat?: number;
  lng?: number;
}

interface InteractiveMapProps {
  metroName?: string;
  corridorName?: string;
  pins?: MapPin[];
  selectedPinId?: string;
  onSelectPin?: (id: string) => void;
  heightClass?: string;
  showHotspotBanner?: boolean;
}

const DEFAULT_PINS: MapPin[] = [
  { id: 'LOS-AB-01', name: 'Ahmadu Bello Financial Wallscape', x: 28, y: 32, status: 'live', code: 'LOS-AB-01', type: 'Static Wallscape', client: 'Access Bank' },
  { id: 'LOS-OZ-11', name: 'Ozumba Mbadiwe Highway Gantry', x: 38, y: 55, status: 'alert', code: 'LOS-OZ-11', type: 'Gantry Unipole', info: 'Obstructed Sightline' },
  { id: 'LOS-VI-088', name: 'Victoria Island Coastal LED Mega-Screen', x: 48, y: 44, status: 'crew', code: 'LOS-VI-088', type: 'DOOH LED', client: 'Safaricom 5G', info: 'Babatunde O. (On-Site)' },
  { id: 'LOS-LK-042', name: 'Lekki Toll Gate Curved DOOH', x: 68, y: 52, status: 'live', code: 'LOS-LK-042', type: '3D Monolith', client: 'Flutterwave' },
  { id: 'LOS-AP-008', name: 'Airport Corridor DOOH', x: 22, y: 65, status: 'audit', code: 'LOS-AP-008', type: 'DOOH LED' },
  { id: 'LOS-IK-042', name: 'Ikorodu Road Cantilever', x: 55, y: 30, status: 'mounting', code: 'LOS-IK-042', type: 'Cantilever' },
];

type GoogleMapsWindow = Window & {
  google?: any;
  __afrioohGoogleMapsReady?: () => void;
};
let mapsLoader: Promise<any> | null = null;

function loadGoogleMaps() {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!key) return Promise.reject(new Error('VITE_GOOGLE_MAPS_API_KEY is not configured.'));
  if ((window as GoogleMapsWindow).google?.maps) return Promise.resolve((window as GoogleMapsWindow).google.maps);
  if (mapsLoader) return mapsLoader;

  mapsLoader = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-afriooh-google-maps]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve((window as GoogleMapsWindow).google.maps));
      existing.addEventListener('error', () => reject(new Error('Google Maps failed to load.')));
      return;
    }
    const callbackName = '__afrioohGoogleMapsReady';
    (window as GoogleMapsWindow).__afrioohGoogleMapsReady = () => {
      delete (window as GoogleMapsWindow).__afrioohGoogleMapsReady;
      resolve((window as GoogleMapsWindow).google.maps);
    };
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=marker&loading=async&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.dataset.afrioohGoogleMaps = 'true';
    script.onerror = () => {
      delete (window as GoogleMapsWindow).__afrioohGoogleMapsReady;
      reject(new Error('Google Maps failed to load. Check the API key and enabled APIs.'));
    };
    document.head.appendChild(script);
  });
  return mapsLoader;
}

const statusColor: Record<MapPin['status'], string> = {
  live: '#059669',
  audit: '#2563eb',
  alert: '#dc2626',
  mounting: '#d97706',
  crew: '#ef5a24',
};

export const GoogleInteractiveMap: React.FC<InteractiveMapProps> = ({
  metroName = 'Lagos Metro',
  corridorName = 'Lekki-Epe Expressway & Victoria Island',
  pins = DEFAULT_PINS,
  selectedPinId = 'LOS-VI-088',
  onSelectPin,
  heightClass = 'h-[360px]',
  showHotspotBanner = true,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const [activePin, setActivePin] = useState(selectedPinId);
  const [mapMode, setMapMode] = useState<'roadmap' | 'satellite'>('roadmap');
  const [zoom, setZoom] = useState(11);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const selectedData = pins.find((pin) => pin.id === activePin) || pins[0];

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps().then((maps) => {
      if (cancelled || !mapRef.current) return;
      mapInstance.current = new maps.Map(mapRef.current, {
        center: { lat: 6.5244, lng: 3.3792 },
        zoom,
        mapId: 'DEMO_MAP_ID',
        mapTypeId: mapMode,
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: false,
      });
      setMapReady(true);
    }).catch((error) => {
      if (!cancelled) setLoadError(error.message);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    const maps = (window as GoogleMapsWindow).google?.maps;
    if (!map || !maps) return;
    map.setMapTypeId(mapMode);
    map.setZoom(zoom);
  }, [mapMode, zoom]);

  useEffect(() => {
    const map = mapInstance.current;
    const maps = (window as GoogleMapsWindow).google?.maps;
    if (!map || !maps) return;
    markers.current.forEach((marker) => marker.setMap(null));
    const bounds = new maps.LatLngBounds();
    markers.current = pins.map((pin) => {
      const position = pin.lat !== undefined && pin.lng !== undefined
        ? { lat: pin.lat, lng: pin.lng }
        : { lat: 6.44 + (100 - pin.y) * 0.00155, lng: 3.25 + pin.x * 0.0057 };
      bounds.extend(position);
      const markerContent = document.createElement('div');
      markerContent.style.display = 'flex';
      markerContent.style.flexDirection = 'column';
      markerContent.style.alignItems = 'center';
      markerContent.style.cursor = 'pointer';
      markerContent.innerHTML = `<span style="width:${pin.id === activePin ? 20 : 16}px;height:${pin.id === activePin ? 20 : 16}px;border-radius:50%;background:${statusColor[pin.status]};border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,.35);display:block"></span><span style="margin-top:2px;padding:2px 4px;border-radius:4px;background:white;color:#181716;font:700 10px sans-serif;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.25)">${pin.code}</span>`;
      const marker = new maps.marker.AdvancedMarkerElement({
        map,
        position,
        title: `${pin.code}: ${pin.name}`,
        content: markerContent,
      });
      marker.addEventListener('gmp-click', () => {
        setActivePin(pin.id);
        onSelectPin?.(pin.id);
      });
      return marker;
    });
    if (pins.length > 1) map.fitBounds(bounds, 48);
    else if (pins.length === 1) map.setCenter(bounds.getCenter());
    return () => markers.current.forEach((marker) => marker.setMap(null));
  }, [pins, activePin, onSelectPin, mapReady]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-[#eae7e1] bg-[#eef1f3] shadow-sm">
      <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-xl border border-[#eae7e1] bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#181716] shadow-sm">
        <Navigation className="h-3.5 w-3.5 text-[#556500]" />
        <span>{corridorName}</span>
      </div>
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5">
        <div className="flex overflow-hidden rounded-lg border border-[#eae7e1] bg-white p-0.5 text-[11px] font-semibold shadow-sm">
          <button onClick={() => setMapMode('roadmap')} className={`rounded px-2 py-1 ${mapMode === 'roadmap' ? 'bg-[#ef5a24] text-white' : 'text-zinc-600 hover:bg-zinc-100'}`}>Map</button>
          <button onClick={() => setMapMode('satellite')} className={`rounded px-2 py-1 ${mapMode === 'satellite' ? 'bg-[#ef5a24] text-white' : 'text-zinc-600 hover:bg-zinc-100'}`}>Satellite</button>
        </div>
        <div className="flex flex-col overflow-hidden rounded-lg border border-[#eae7e1] bg-white text-xs shadow-sm">
          <button onClick={() => setZoom((value) => Math.min(value + 1, 19))} className="flex h-8 w-8 items-center justify-center border-b border-zinc-100 font-bold text-zinc-700 hover:bg-zinc-100">+</button>
          <button onClick={() => setZoom((value) => Math.max(value - 1, 8))} className="flex h-8 w-8 items-center justify-center font-bold text-zinc-700 hover:bg-zinc-100">-</button>
        </div>
      </div>
      <div className={`relative w-full ${heightClass}`}>
        <div ref={mapRef} className="h-full w-full" />
        {loadError && <div className="absolute inset-0 flex items-center justify-center bg-[#f8f7f4] p-6 text-center text-sm text-zinc-600"><div><p className="font-bold text-[#181716]">Google Maps unavailable</p><p className="mt-1">{loadError}</p></div></div>}
        {selectedData && <div className="absolute bottom-3 left-3 z-10 max-w-[260px] rounded-xl bg-[#ef5a24] p-3 text-xs text-white shadow-xl shadow-[#ef5a24]/20"><div className="mb-1 flex items-center justify-between gap-2"><span className="font-bold uppercase tracking-wider text-white/90">{selectedData.status === 'crew' ? 'Crew On-Site' : 'Active Site'}</span><span className="rounded bg-black/20 px-1.5 py-0.5 text-white/95">{selectedData.code}</span></div><p className="font-semibold text-white">{selectedData.name}</p>{selectedData.client && <p className="mt-0.5 text-orange-100">Campaign: {selectedData.client}</p>}</div>}
        {!loadError && !mapReady && <div className="absolute inset-0 flex items-center justify-center bg-white/60 text-xs font-semibold text-zinc-600">Loading Google Maps...</div>}
      </div>
      {showHotspotBanner && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eae7e1] bg-white/95 px-4 py-2 text-xs text-[#181716]"><div className="flex items-center gap-2"><Navigation className="h-4 w-4 text-[#556500]" /><span className="font-bold">Current Hotspot:</span><span className="text-zinc-600">{corridorName}</span></div><div className="flex items-center gap-3 font-semibold"><span className="inline-flex items-center gap-1.5 text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500" />8 Digital Monoliths</span><span className="text-zinc-300">•</span><span className="text-zinc-700">{metroName} telemetry</span></div></div>}
    </div>
  );
};