
import React, { useMemo, useState } from 'react';
import { LPBData } from '../types';
import { LineChart, TrendingUp, Users, Calendar, Info, Activity, Layers } from 'lucide-react';

interface DailyRealizationChartProps {
  data: LPBData[];
  selectedPetugas: string | null;
  onClearSelection: () => void;
}

const UNIT_COLORS: Record<string, string> = {
  'BUKITTINGGI': '#6366f1', // Indigo Vibrant
  'PADANG PANJANG': '#10b981', // Emerald
  'BASO': '#f59e0b', // Amber
  'LUBUK BASUNG': '#f43f5e', // Rose/Red
  'PAYAKUMBUH': '#06b6d4', // Cyan
  'DEFAULT': '#94a3b8' // Slate
};

const DailyRealizationChart: React.FC<DailyRealizationChartProps> = ({ data, selectedPetugas, onClearSelection }) => {
  const [hoveredIndex, setHoveredIndex] = useState<{ dateIdx: number, unit?: string } | null>(null);

  const uniqueDates = useMemo(() => {
    const dates = new Set<string>();
    data.forEach(item => { if (item.TANGGAL) dates.add(String(item.TANGGAL)); });
    return Array.from(dates).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [data]);

  const units = useMemo(() => {
    const u = new Set<string>();
    data.forEach(item => { if (item.UNIT) u.add(item.UNIT); });
    return Array.from(u).sort();
  }, [data]);

  // Data Agregasi
  const processedData = useMemo(() => {
    if (selectedPetugas) {
      // Mode Petugas Tunggal
      return [{
        label: selectedPetugas,
        color: '#10b981',
        points: uniqueDates.map(date => {
          const items = data.filter(item => String(item.TANGGAL) === date && item.PETUGAS === selectedPetugas);
          const real = items.reduce((acc, curr) => acc + (curr.LUNAS_MANDIRI || 0) + (curr.LUNAS_OFFLINE || 0) + (curr.JANJI_BAYAR || 0), 0);
          const target = items.reduce((acc, curr) => acc + (curr.TOTALLEMBAR || 0), 0);
          return { date, real, target };
        })
      }];
    } else {
      // Mode Multi-Unit
      return units.map(unit => ({
        label: unit,
        color: UNIT_COLORS[unit] || UNIT_COLORS.DEFAULT,
        points: uniqueDates.map(date => {
          const items = data.filter(item => String(item.TANGGAL) === date && item.UNIT === unit);
          const real = items.reduce((acc, curr) => acc + (curr.LUNAS_MANDIRI || 0) + (curr.LUNAS_OFFLINE || 0) + (curr.JANJI_BAYAR || 0), 0);
          const target = items.reduce((acc, curr) => acc + (curr.TOTALLEMBAR || 0), 0);
          return { date, real, target };
        })
      }));
    }
  }, [uniqueDates, units, data, selectedPetugas]);

  const maxVal = useMemo(() => {
    let max = 10;
    processedData.forEach(series => {
      series.points.forEach(p => { if (p.real > max) max = p.real; if (p.target > max) max = p.target; });
    });
    return max * 1.15;
  }, [processedData]);

  const chartHeight = 280;
  const paddingX = 50;

  const renderPaths = useMemo(() => {
    const width = 1000;
    const stepX = uniqueDates.length > 1 ? (width - paddingX * 2) / (uniqueDates.length - 1) : 0;

    return processedData.map(series => {
      const coords = series.points.map((p, i) => ({
        x: paddingX + i * stepX,
        y: chartHeight - (p.real / maxVal * chartHeight)
      }));

      const line = coords.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
      const fill = `${line} L ${coords[coords.length - 1].x} ${chartHeight} L ${coords[0].x} ${chartHeight} Z`;

      return { ...series, line, fill, coords };
    });
  }, [processedData, uniqueDates, maxVal]);

  return (
    <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden h-full flex flex-col shadow-sm fade-in">
      <div className="p-6 bg-slate-950 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
            {selectedPetugas ? <Users size={20} /> : <Layers size={20} />}
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest italic leading-none">
              {selectedPetugas ? `Tren Kinerja: ${selectedPetugas}` : 'Tren Realisasi Per Unit'}
            </h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase mt-1 tracking-widest">
              {selectedPetugas ? 'Statistik Performa Individu' : 'Visualisasi Data Multi-Series'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!selectedPetugas && (
             <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 bg-white/5 px-4 py-2 rounded-xl max-w-[400px]">
                {units.map(unit => (
                  <div key={unit} className="flex items-center gap-1.5 whitespace-nowrap">
                    <div className="w-2 h-2 rounded-full shadow-[0_0_4px_currentColor]" style={{ backgroundColor: UNIT_COLORS[unit] || UNIT_COLORS.DEFAULT, color: UNIT_COLORS[unit] || UNIT_COLORS.DEFAULT }}></div>
                    <span className="text-[8px] font-black text-white/80 uppercase tracking-tighter">{unit}</span>
                  </div>
                ))}
             </div>
          )}
          {selectedPetugas && (
            <button onClick={onClearSelection} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2">
              <Activity size={12}/> Reset ke Unit
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 p-10 pt-4 flex flex-col bg-slate-50/50 relative">
        <div className="relative flex-1 w-full">
          {/* Grid lines */}
          <div className="absolute inset-0 pointer-events-none">
            {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
              <div key={i} className="absolute left-0 right-0 border-t border-slate-200/60" style={{ bottom: `${p * 100}%` }}>
                <span className="absolute -left-2 -translate-x-full text-[8px] font-black text-slate-400">{Math.round(p * maxVal)}</span>
              </div>
            ))}
          </div>

          <svg viewBox={`0 0 1000 ${chartHeight}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
            {renderPaths.map((series, idx) => (
              <g key={series.label}>
                <defs>
                  <linearGradient id={`grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={series.color} stopOpacity="0.1" />
                    <stop offset="100%" stopColor={series.color} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={series.fill} fill={`url(#grad-${idx})`} className="transition-all duration-700" />
                <path 
                  d={series.line} 
                  fill="none" 
                  stroke={series.color} 
                  strokeWidth={hoveredIndex?.unit === series.label ? "6" : "3.5"} 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="transition-all duration-300 drop-shadow-sm" 
                />
                
                {series.coords.map((p, i) => (
                  <g key={i}>
                    <rect x={p.x - 15} y={0} width={30} height={chartHeight} fill="transparent" className="cursor-pointer" 
                      onMouseEnter={() => setHoveredIndex({ dateIdx: i, unit: series.label })}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                    {(hoveredIndex?.dateIdx === i && (hoveredIndex.unit === series.label || !hoveredIndex.unit)) && (
                      <circle cx={p.x} cy={p.y} r="6" fill={series.color} stroke="white" strokeWidth="2.5" className="drop-shadow-md" />
                    )}
                  </g>
                ))}
              </g>
            ))}
          </svg>

          <div className="absolute -bottom-8 left-0 right-0 flex justify-between px-[5%] pointer-events-none">
            {uniqueDates.map((d, i) => (
              <span key={i} className={`text-[9px] font-black uppercase transition-colors ${hoveredIndex?.dateIdx === i ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
                {d}
              </span>
            ))}
          </div>

          {hoveredIndex !== null && (
            <div className="absolute z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-white/10 min-w-[200px] pointer-events-none fade-in"
              style={{ left: `${(hoveredIndex.dateIdx / (uniqueDates.length - 1)) * 75 + 12.5}%`, top: '5%' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TANGGAL {uniqueDates[hoveredIndex.dateIdx]}</p>
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hoveredIndex.unit ? (UNIT_COLORS[hoveredIndex.unit] || UNIT_COLORS.DEFAULT) : '#10b981' }}></div>
              </div>
              <p className="text-[11px] font-black uppercase text-white mb-2">{hoveredIndex.unit || selectedPetugas}</p>
              <div className="space-y-2.5 pt-2.5 border-t border-white/10">
                {processedData.filter(s => !hoveredIndex.unit || s.label === hoveredIndex.unit).map(series => (
                  <div key={series.label} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-black">
                      <span className="text-emerald-400">REALISASI</span>
                      <span>{series.points[hoveredIndex.dateIdx].real}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-black">
                      <span className="text-slate-400">TARGET WO</span>
                      <span>{series.points[hoveredIndex.dateIdx].target}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-8 py-5 bg-white border-t border-slate-100 flex justify-around items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><TrendingUp size={18} /></div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5 tracking-widest">Total Realisasi</p>
            <p className="text-sm font-black text-slate-900">{processedData.reduce((acc, s) => acc + s.points.reduce((a, b) => a + b.real, 0), 0).toLocaleString()} <span className="text-[9px] text-slate-400">LM</span></p>
          </div>
        </div>
        <div className="h-8 w-px bg-slate-100"></div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600"><Calendar size={18} /></div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5 tracking-widest">Rentang Waktu</p>
            <p className="text-sm font-black text-slate-900">{uniqueDates.length} <span className="text-[9px] text-slate-400">HARI</span></p>
          </div>
        </div>
        <div className="h-8 w-px bg-slate-100"></div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600"><Info size={18} /></div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5 tracking-widest">Rata-rata Harian</p>
            <p className="text-sm font-black text-indigo-700">
              {Math.round(processedData.reduce((acc, s) => acc + s.points.reduce((a, b) => a + b.real, 0), 0) / (uniqueDates.length || 1))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyRealizationChart;
