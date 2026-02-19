
import React, { useState, useEffect, useMemo } from 'react';
import { FilterState } from '../types';
import { LayoutDashboard, Filter, Search, RefreshCcw, Clock, X, RotateCcw } from 'lucide-react';

interface HeaderProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  options: {
    blth: string[];
    unit: string[];
    pegawai: string[];
  };
  onRefresh: () => void;
  totalCount: number;
  isRefreshing: boolean;
  lastSync: number;
  activePageName: string;
}

const Header: React.FC<HeaderProps> = ({ 
  filters, setFilters, options, onRefresh, totalCount, isRefreshing, lastSync, activePageName
}) => {
  const [timeAgo, setTimeAgo] = useState('Baru saja');

  // Cek apakah ada filter yang sedang aktif
  const hasActiveFilters = useMemo(() => {
    return filters.blth !== '' || filters.unit !== '' || filters.PETUGAS !== '' || filters.validasi !== '';
  }, [filters]);

  const resetAllFilters = () => {
    setFilters({
      blth: '',
      unit: '',
      PETUGAS: '',
      validasi: ''
    });
  };

  useEffect(() => {
    const updateTime = () => {
      if (!lastSync) return;
      const seconds = Math.floor((Date.now() - lastSync) / 1000);
      if (seconds < 60) setTimeAgo('Baru saja');
      else if (seconds < 3600) setTimeAgo(`${Math.floor(seconds / 60)} menit lalu`);
      else setTimeAgo(`${Math.floor(seconds / 3600)} jam lalu`);
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, [lastSync]);

  return (
    <header className="flex flex-row items-center justify-between gap-10">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic leading-none flex items-center gap-3">
            <div className="w-2 h-8 bg-orange-600 rounded-full"></div>
            MONITORING <span className="text-orange-700">{activePageName}</span>
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-full text-white">
              <span className={`inline-block w-2 h-2 rounded-full ${isRefreshing ? 'bg-orange-600 animate-pulse' : 'bg-emerald-500'}`}></span>
              <p className="text-[10px] font-black tracking-[0.2em]">{totalCount.toLocaleString()} DATA AKTIF</p>
            </div>
            <p className="text-[11px] font-bold text-slate-400 flex items-center gap-2 uppercase">
              <Clock size={14} className="text-indigo-600" /> TERAKHIR SINKRONISASI: <span className="text-slate-600">{timeAgo}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 shadow-inner">
          <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
            <Filter size={18} className="text-slate-400" />
          </div>
          
          <select 
            value={filters.blth}
            onChange={(e) => setFilters(prev => ({ ...prev, blth: e.target.value }))}
            className="bg-transparent border-none text-xs font-black focus:ring-0 text-slate-900 outline-none cursor-pointer px-3 h-10 min-w-[120px]"
          >
            <option value="">PERIODE DATA</option>
            {options.blth.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>

          <div className="w-px h-6 bg-slate-200"></div>

          <select 
            value={filters.unit}
            onChange={(e) => setFilters(prev => ({ ...prev, unit: e.target.value }))}
            className="bg-transparent border-none text-xs font-black focus:ring-0 text-slate-900 outline-none cursor-pointer px-3 h-10 min-w-[150px]"
          >
            <option value="">SEMUA KANTOR UNIT</option>
            {options.unit.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>

          <div className="w-px h-6 bg-slate-200"></div>

          <div className="flex items-center gap-3 px-3 relative group min-w-[280px]">
            <Search size={18} className={`shrink-0 transition-all ${filters.PETUGAS ? 'text-orange-700 scale-110' : 'text-slate-400'}`} />
            <input 
              type="text" 
              placeholder="IDENTITAS PETUGAS..." 
              value={filters.PETUGAS}
              onChange={(e) => setFilters(prev => ({ ...prev, PETUGAS: e.target.value }))}
              className="bg-transparent border-none text-xs font-black focus:ring-0 text-slate-900 outline-none flex-1 placeholder:text-slate-400"
            />
            {filters.PETUGAS && (
              <button 
                onClick={() => setFilters(prev => ({ ...prev, PETUGAS: '' }))}
                className="hover:bg-rose-100 hover:text-rose-700 text-slate-400 p-1.5 rounded-lg transition-all"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Tombol Global Reset */}
          {hasActiveFilters && (
            <button 
              onClick={resetAllFilters}
              className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl transition-all shadow-lg animate-in zoom-in-95 duration-200"
            >
              <RotateCcw size={14} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">RESET</span>
            </button>
          )}
        </div>

        <button 
          onClick={onRefresh}
          disabled={isRefreshing}
          className={`
            h-14 px-6 flex items-center justify-center gap-3 rounded-2xl transition-all shadow-xl active:scale-95 group relative overflow-hidden
            ${isRefreshing ? 'bg-slate-200 cursor-not-allowed text-slate-400' : 'bg-orange-700 hover:bg-orange-800 text-white shadow-orange-900/20'}
          `}
        >
          <RefreshCcw size={20} className={`${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
          <span className="text-xs font-black uppercase tracking-[0.2em] hidden xl:inline">SINKRON PAKSA</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
