
import React, { useState, useEffect } from 'react';
import { FilterState } from '../types';
import { LayoutDashboard, Filter, Search, RefreshCcw, Clock, X } from 'lucide-react';

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
}

const Header: React.FC<HeaderProps> = ({ 
  filters, setFilters, options, onRefresh, totalCount, isRefreshing, lastSync 
}) => {
  const [timeAgo, setTimeAgo] = useState('Just now');

  useEffect(() => {
    const updateTime = () => {
      if (!lastSync) return;
      const seconds = Math.floor((Date.now() - lastSync) / 1000);
      if (seconds < 60) setTimeAgo('Just now');
      else if (seconds < 3600) setTimeAgo(`${Math.floor(seconds / 60)}m ago`);
      else setTimeAgo(`${Math.floor(seconds / 3600)}h ago`);
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, [lastSync]);

  return (
    <header className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-2xl shadow-slate-300/60 sticky top-0 z-[1001]">
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 bg-orange-700 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-200 relative transition-transform hover:scale-105">
          <LayoutDashboard className="text-white" size={32} />
          {isRefreshing && (
             <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-600 rounded-full border-2 border-white animate-ping"></div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic leading-none">
            LPB <span className="text-orange-700">MONITORING</span>
          </h1>
          <div className="flex items-center gap-3 mt-1.5">
            <p className="text-[11px] font-black text-slate-600 tracking-widest flex items-center gap-2">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${isRefreshing ? 'bg-orange-600 animate-pulse' : 'bg-emerald-600'}`}></span>
              {totalCount.toLocaleString()} RECORDS FOUND
            </p>
            <span className="text-slate-300 font-light">|</span>
            <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
              <Clock size={12} className="text-indigo-600" /> SYNC: <span className="text-slate-900">{timeAgo}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
        <div className="flex items-center gap-3 bg-slate-100 p-2.5 rounded-2xl border-2 border-slate-200 shadow-sm">
          <Filter size={18} className="text-slate-600 ml-1" />
          
          <select 
            value={filters.blth}
            onChange={(e) => setFilters(prev => ({ ...prev, blth: e.target.value }))}
            className="bg-transparent border-none text-[12px] font-black focus:ring-0 text-slate-900 outline-none cursor-pointer px-1"
          >
            <option value="">PERIODE</option>
            {options.blth.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>

          <div className="w-px h-6 bg-slate-300"></div>

          <select 
            value={filters.unit}
            onChange={(e) => setFilters(prev => ({ ...prev, unit: e.target.value }))}
            className="bg-transparent border-none text-[12px] font-black focus:ring-0 text-slate-900 outline-none cursor-pointer px-1"
          >
            <option value="">SEMUA UNIT</option>
            {options.unit.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>

          <div className="w-px h-6 bg-slate-300"></div>

          <div className="flex items-center gap-3 px-1 relative group">
            <Search size={16} className={`transition-colors ${filters.PETUGAS ? 'text-orange-700' : 'text-slate-500'}`} />
            <input 
              type="text" 
              placeholder="CARI PETUGAS..." 
              value={filters.PETUGAS}
              onChange={(e) => setFilters(prev => ({ ...prev, PETUGAS: e.target.value }))}
              className="bg-transparent border-none text-[12px] font-black focus:ring-0 text-slate-900 outline-none w-36 placeholder:text-slate-500 focus:w-48 transition-all"
            />
            {filters.PETUGAS && (
              <button 
                onClick={() => setFilters(prev => ({ ...prev, PETUGAS: '' }))}
                className="hover:text-rose-700 text-slate-500 p-1"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <button 
          onClick={onRefresh}
          disabled={isRefreshing}
          className={`
            p-4 rounded-2xl transition-all shadow-lg active:scale-95 group relative
            ${isRefreshing ? 'bg-slate-200 cursor-not-allowed text-slate-400' : 'bg-orange-700 hover:bg-orange-800 text-white hover:shadow-orange-300/50'}
          `}
          title="Force Refresh Data"
        >
          <RefreshCcw size={22} className={`${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
        </button>
      </div>
    </header>
  );
};

export default Header;
