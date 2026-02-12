
import React, { useState, useEffect, useMemo } from 'react';
import { fetchLPBData } from './services/sheetService';
import { LPBData, FilterState } from './types';
import Header from './components/Header';
import InfoPanel from './components/InfoPanel';
import MapPanel from './components/MapPanel';
import DataTable from './components/DataTable';
import SummaryPanel from './components/SummaryPanel';
import PetugasSummaryPanel from './components/PetugasSummaryPanel';
import SidebarNav from './components/SidebarNav';
import PagePlaceholder from './components/PagePlaceholder';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [rawData, setRawData] = useState<LPBData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState<number>(0);
  const [selectedItem, setSelectedItem] = useState<LPBData | null>(null);
  const [activePage, setActivePage] = useState<string>('DASHBOARD');
  
  const [filters, setFilters] = useState<FilterState>({
    blth: '',
    unit: '',
    PETUGAS: '',
    validasi: ''
  });

  const [debouncedFilters, setDebouncedFilters] = useState<FilterState>(filters);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 400);
    return () => clearTimeout(handler);
  }, [filters]);

  const loadData = async (force = false) => {
    if (force) setIsRefreshing(true);
    const result = await fetchLPBData(force);
    setRawData(result.data);
    setLastSync(result.timestamp);
    setLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredData = useMemo(() => {
    if (!debouncedFilters.blth && !debouncedFilters.unit && !debouncedFilters.PETUGAS && !debouncedFilters.validasi) return rawData;
    
    return rawData.filter(item => {
      const matchBlth = !debouncedFilters.blth || item.BLTH === debouncedFilters.blth;
      const matchUnit = !debouncedFilters.unit || item.UNIT === debouncedFilters.unit;
      const matchPetugas = !debouncedFilters.PETUGAS || 
                           item.PETUGAS?.toLowerCase().includes(debouncedFilters.PETUGAS.toLowerCase());
      const matchValidasi = !debouncedFilters.validasi || item.VALIDASI === debouncedFilters.validasi;
      return matchBlth && matchUnit && matchPetugas && matchValidasi;
    });
  }, [rawData, debouncedFilters]);

  const filterOptions = useMemo(() => {
    return {
      blth: Array.from(new Set(rawData.map(d => d.BLTH))).filter(Boolean).sort(),
      unit: Array.from(new Set(rawData.map(d => d.UNIT))).filter(Boolean).sort(),
      pegawai: []
    };
  }, [rawData]);

  const handleRowClick = React.useCallback((item: LPBData) => {
    setSelectedItem(item);
  }, []);

  if (loading && rawData.length === 0) {
    return (
      <div className="h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 text-orange-700">
        <Loader2 className="animate-spin" size={64} />
        <p className="text-xl font-black tracking-widest animate-pulse uppercase">Syncing Cloud Database...</p>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="flex flex-col gap-3 h-full overflow-hidden">
      {/* TIER 1: PRIMARY MONITORING (TOP 50%) */}
      <div className="flex flex-row gap-3 h-[50%] min-h-[320px]">
        {/* Unit Recap - Fixed Ratio Left */}
        <div className="flex-[2.2] h-full">
          <SummaryPanel data={rawData} />
        </div>
        
        {/* Map Hub - Center */}
        <div className="flex-[5.3] h-full">
          <MapPanel data={filteredData} selectedId={selectedItem?.IDPEL || null} />
        </div>

        {/* Info Panel - Fixed Ratio Right */}
        <div className="flex-[2.5] h-full">
          <InfoPanel data={selectedItem} allData={rawData} />
        </div>
      </div>

      {/* TIER 2: SECONDARY LOGS & PERFORMANCE (BOTTOM 50%) */}
      <div className="flex flex-row gap-3 h-[50%] min-h-[320px]">
        {/* Petugas Performance - Aligned with Unit Recap above */}
        <div className="flex-[2.2] h-full">
          <PetugasSummaryPanel data={rawData} />
        </div>

        {/* Technical Monitoring Log - Expanded Right Side */}
        <div className="flex-[7.8] h-full min-w-0">
          <DataTable 
            data={filteredData} 
            onRowClick={handleRowClick} 
            selectedId={selectedItem?.IDPEL || null} 
            filters={filters}
            setFilters={setFilters}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen bg-slate-100 flex flex-col overflow-hidden">
      {/* 1. NAVIGATION HEADER */}
      <SidebarNav activePage={activePage} onPageChange={setActivePage} />

      {/* 2. CONTROL STRIP (Filters & Sync Status) */}
      <div className="p-3 lg:px-4 shrink-0 bg-white/50 border-b border-slate-200">
        <Header 
          filters={filters} 
          setFilters={setFilters} 
          options={filterOptions} 
          onRefresh={() => loadData(true)}
          totalCount={filteredData.length}
          isRefreshing={isRefreshing}
          lastSync={lastSync}
        />
      </div>

      {/* 3. MAIN WORKSPACE */}
      <main className="flex-1 px-3 lg:px-4 pb-3 min-h-0">
        {activePage === 'DASHBOARD' ? renderDashboard() : <PagePlaceholder title={activePage} />}
      </main>

      {/* 4. ENTERPRISE FOOTER */}
      <footer className="flex justify-between items-center text-slate-500 text-[8px] font-black py-1 px-6 border-t border-slate-200 uppercase tracking-[0.2em] shrink-0 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
          <span>Dashboard Analisis Kinerja & Informasi Terpadu Manbill </span>
        </div>
        <div className="flex items-center gap-4">
           <span>Performance Optimized System</span>
           <span className="text-slate-300">|</span>
           <span>© {new Date().getFullYear()} CORE SYSTEMS</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
