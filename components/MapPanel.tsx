
import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { LPBData } from '../types';

// Custom Marker Icons
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const activeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const DEFAULT_CENTER: [number, number] = [-0.947, 100.417]; // Padang Area
const DEFAULT_ZOOM = 10;

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

interface MapPanelProps {
  data: LPBData[];
  selectedId: string | null;
}

const MapPanel: React.FC<MapPanelProps> = ({ data, selectedId }) => {
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  const allPointsWithCoords = useMemo(() => data.filter(d => 
    d.LATITUDE && d.LONGITUDE && d.LATITUDE !== 0 && d.LONGITUDE !== 0
  ), [data]);

  const displayPoints = useMemo(() => selectedId 
    ? allPointsWithCoords.filter(p => p.IDPEL === selectedId)
    : allPointsWithCoords, [selectedId, allPointsWithCoords]);

  useEffect(() => {
    if (selectedId) {
      const selected = data.find(d => d.IDPEL === selectedId);
      if (selected && selected.LATITUDE && selected.LONGITUDE) {
        setCenter([selected.LATITUDE, selected.LONGITUDE]);
        setZoom(17);
      }
    }
  }, [selectedId, data]);

  return (
    <div className="bg-white border-2 border-slate-300 rounded-2xl overflow-hidden h-full shadow-lg relative group transition-all duration-300">
      <div className="absolute top-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-2xl text-white">
        <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em] mb-1">
          {selectedId ? 'TARGETING NODE' : 'GEO-ANALYTICS OVERVIEW'}
        </p>
        <p className="text-sm font-black border-l-2 border-orange-500 pl-3">
          {displayPoints.length.toLocaleString()} NODES MAPPED
        </p>
      </div>
      
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} preferCanvas={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={center} zoom={zoom} />
        {displayPoints.map((point) => (
          <Marker 
            key={point.IDPEL} 
            position={[point.LATITUDE!, point.LONGITUDE!]}
            icon={selectedId === point.IDPEL ? activeIcon : customIcon}
          >
            <Popup minWidth={220}>
              <div className="text-slate-900 font-sans overflow-hidden">
                <div className="bg-slate-900 p-3">
                  <p className="font-black text-xs uppercase tracking-tight text-white m-0 leading-tight">
                    {point.NAMA}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1 m-0 tracking-widest">{point.IDPEL}</p>
                </div>
                <div className="p-3 bg-white space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase">
                    <span className="text-slate-400">UNIT</span>
                    <span className="text-slate-900">{point.UNIT}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase">
                    <span className="text-slate-400">STATUS</span>
                    <span className={`px-2 py-0.5 rounded-full ${point.VALIDASI === 'VALID' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {point.VALIDASI}
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default React.memo(MapPanel);
