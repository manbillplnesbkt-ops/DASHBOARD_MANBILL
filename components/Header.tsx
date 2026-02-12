
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
    <header className="flex flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <h1 className="text-sm lg:text-base font-black tracking-tighter text-slate-900 uppercase italic leading-none">
            LPB <span className="text-orange-700">MONITORING</span>
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[9px] font-black text-slate-500 tracking-widest flex items-center gap-1">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${isRefreshing ? 'bg-orange-600 animate-pulse' : 'bg-emerald-600'}`}></span>
              {totalCount.toLocaleString()} RECORDS
            </p>
            <span className="text-slate-300">|</span>
            <p className="text-[9px] font-bold text-slate-400 flex items-center gap-1 uppercase">
              <Clock size={10} className="text-indigo-600" /> {timeAgo}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <Filter size={14} className="text-slate-500 ml-1 shrink-0" />
          
          <select 
            value={filters.blth}
            onChange={(e) => setFilters(prev => ({ ...prev, blth: e.target.value }))}
            className="bg-transparent border-none text-[9px] font-black focus:ring-0 text-slate-900 outline-none cursor-pointer px-1 py-0 h-7"
          >
            <option value="">PERIODE</option>
            {options.blth.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>

          <div className="w-px h-4 bg-slate-300"></div>

          <select 
            value={filters.unit}
            onChange={(e) => setFilters(prev => ({ ...prev, unit: e.target.value }))}
            className="bg-transparent border-none text-[9px] font-black focus:ring-0 text-slate-900 outline-none cursor-pointer px-1 py-0 h-7"
          >
            <option value="">ALL UNIT</option>
            {options.unit.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>

          <div className="w-px h-4 bg-slate-300"></div>

          <div className="flex items-center gap-1 px-1 relative group">
            <Search size={14} className={`shrink-0 transition-colors ${filters.PETUGAS ? 'text-orange-700' : 'text-slate-400'}`} />
            <input 
              type="text" 
              placeholder="PETUGAS..." 
              value={filters.PETUGAS}
              onChange={(e) => setFilters(prev => ({ ...prev, PETUGAS: e.target.value }))}
              className="bg-transparent border-none text-[9px] font-black focus:ring-0 text-slate-900 outline-none w-24 lg:w-32 placeholder:text-slate-400 py-0 h-7"
            />
            {filters.PETUGAS && (
              <button 
                onClick={() => setFilters(prev => ({ ...prev, PETUGAS: '' }))}
                className="hover:text-rose-700 text-slate-400 p-0.5"
              >
                <X size={10} />
              </button>
            )}
          </div>
        </div>

        <button 
          onClick={onRefresh}
          disabled={isRefreshing}
          className={`
            h-9 w-9 flex items-center justify-center rounded-xl transition-all shadow-sm active:scale-95 group relative
            ${isRefreshing ? 'bg-slate-100 cursor-not-allowed text-slate-300' : 'bg-orange-700 hover:bg-orange-800 text-white shadow-orange-900/10'}
          `}
          title="Force Refresh Data"
        >
          <RefreshCcw size={16} className={`${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
        </button>
      </div>
    </header>
  );
};

export default Header;
