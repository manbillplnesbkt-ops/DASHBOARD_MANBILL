
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap, useMapEvents, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import { LPBData } from '../types';
import { User, Zap, Hash, MapPin, Info, Navigation, Radio } from 'lucide-react';

const activeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const DEFAULT_CENTER: [number, number] = [-0.228, 100.632]; 
const DEFAULT_ZOOM = 12;

interface MapBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

function MapController({ 
  selectedItem, 
  onBoundsChange,
  containerRef
}: { 
  selectedItem: LPBData | null, 
  onBoundsChange: (bounds: MapBounds) => void,
  containerRef: React.RefObject<HTMLDivElement | null>
}) {
  const map = useMap();
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(containerRef.current);
    const timers = [100, 500, 1000].map(ms => setTimeout(() => map.invalidateSize(), ms));
    return () => {
      resizeObserver.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [map, containerRef]);

  const reportBounds = () => {
    const b = map.getBounds();
    onBoundsChange({
      minLat: b.getSouth(),
      maxLat: b.getNorth(),
      minLng: b.getWest(),
      maxLng: b.getEast()
    });
  };

  useMapEvents({
    moveend: reportBounds,
    zoomend: reportBounds,
  });

  useEffect(() => {
    if (!initialLoadDone.current) {
      setTimeout(reportBounds, 800); 
      initialLoadDone.current = true;
    }
  }, []);

  useEffect(() => {
    if (selectedItem && selectedItem.LATITUDE && selectedItem.LONGITUDE) {
      const lat = Number(selectedItem.LATITUDE);
      const lng = Number(selectedItem.LONGITUDE);
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        map.flyTo([lat, lng], 18, { duration: 1.5, easeLinearity: 0.25 });
      }
    }
  }, [selectedItem, map]);

  return null;
}

interface MapPanelProps {
  data: LPBData[];
  selectedItem: LPBData | null;
  onBoundsChange: (bounds: MapBounds) => void;
}

const MapPanel: React.FC<MapPanelProps> = ({ data, selectedItem, onBoundsChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  const validMarkers = useMemo(() => data.filter(d => 
    d.LATITUDE && d.LONGITUDE && !isNaN(Number(d.LATITUDE))
  ), [data]);

  return (
    <div ref={containerRef} className="bg-white border border-slate-200 rounded-[32px] overflow-hidden h-full w-full shadow-sm relative flex flex-col">
      {/* HUD Overlay */}
      <div className="absolute top-5 left-5 z-[1001] pointer-events-none">
        <div className="bg-slate-950/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl text-white min-w-[160px]">
          <div className="flex items-center gap-2 mb-2">
            <Radio className="text-emerald-500 animate-pulse" size={14} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">Mesin Geospasial</p>
          </div>
          <div className="space-y-1">
            <p className="text-xl font-black tracking-tighter">
              {validMarkers.length.toLocaleString()}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Titik Aktif di Layar</p>
          </div>
        </div>
      </div>

      <div className="absolute top-5 right-5 z-[1001] flex flex-col gap-2">
        <button 
          onClick={() => mapInstance?.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM)}
          className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-xl border border-slate-200 text-slate-700 hover:text-indigo-600 hover:bg-white transition-all active:scale-90"
        >
          <Navigation size={18} />
        </button>
      </div>
      
      <div className="flex-1 w-full relative">
        <div className="absolute inset-0">
          <MapContainer 
            center={DEFAULT_CENTER} 
            zoom={DEFAULT_ZOOM} 
            scrollWheelZoom={true} 
            preferCanvas={true} 
            zoomControl={false}
            className="w-full h-full"
            ref={setMapInstance}
          >
            <LayersControl position="bottomright">
              <LayersControl.BaseLayer checked name="Peta Terang">
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Peta Jalan">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Satelit">
                <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />
              </LayersControl.BaseLayer>
            </LayersControl>
            
            <MapController selectedItem={selectedItem} onBoundsChange={onBoundsChange} containerRef={containerRef} />
            
            {validMarkers.map((point) => (
              <CircleMarker
                key={`${point.IDPEL}`}
                center={[Number(point.LATITUDE), Number(point.LONGITUDE)]}
                radius={selectedItem?.IDPEL === point.IDPEL ? 10 : 7}
                pathOptions={{
                  fillColor: point.VALIDASI === 'VALID' ? '#10b981' : '#f43f5e',
                  color: 'white',
                  weight: selectedItem?.IDPEL === point.IDPEL ? 4 : 2,
                  fillOpacity: 0.9,
                }}
                eventHandlers={{ click: (e) => { L.DomEvent.stopPropagation(e); e.target.openPopup(); } }}
              >
                <Popup minWidth={280}>
                  <div className="bg-slate-950 p-4 text-white">
                    <div className="flex items-center gap-2 mb-1">
                      <Hash size={12} className="text-indigo-400" />
                      <span className="text-[10px] font-black tracking-widest uppercase opacity-60">IDPEL: {point.IDPEL}</span>
                    </div>
                    <h3 className="text-[14px] font-black uppercase truncate">{point.NAMA}</h3>
                  </div>
                  <div className="p-5 bg-white space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                         <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Daya</p>
                         <p className="text-xs font-extrabold text-slate-900">{point.TARIF}/{point.DAYA}VA</p>
                       </div>
                       <div className="text-right">
                         <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Status</p>
                         <span className={`status-badge inline-block ${point.VALIDASI === 'VALID' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{point.VALIDASI}</span>
                       </div>
                    </div>
                    <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
                      <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                      <p className="text-[11px] font-bold text-slate-600 leading-snug uppercase italic">{point.ALAMAT || 'Data Alamat Tidak Tersedia'}</p>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {selectedItem && selectedItem.LATITUDE && selectedItem.LONGITUDE && (
              <Marker position={[Number(selectedItem.LATITUDE), Number(selectedItem.LONGITUDE)]} icon={activeIcon} zIndexOffset={2000} />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MapPanel);
