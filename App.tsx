
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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 text-orange-700">
        <Loader2 className="animate-spin" size={64} />
        <p className="text-xl font-black tracking-widest animate-pulse uppercase">Syncing Database...</p>
      </div>
    );
  }

  const renderContent = () => {
    if (activePage !== 'DASHBOARD') {
      return <PagePlaceholder title={activePage} />;
    }

    return (
      <div className="flex flex-col gap-2"> {/* GAP-2 DI SINI UNTUK MERAPATKAN MAP KE INFO */}
        {/* MAP PANEL */}
        <div className="h-[450px] w-full">
          <MapPanel data={filteredData} selectedId={selectedItem?.IDPEL || null} />
        </div>

        {/* CONTAINER KHUSUS INFORMASI + TABEL DENGAN JARAK RAPAT (GAP-2) */}
        <div className="flex flex-col gap-2">
          {/* DETAIL PELANGGAN */}
          <div className="min-h-[300px] w-full">
            <InfoPanel data={selectedItem} allData={rawData} />
          </div>

          {/* TECHNICAL MONITORING - Tinggi 600px */}
          <div className="w-full">
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
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 lg:p-6 flex flex-col gap-6 max-w-[1800px] mx-auto transition-all">
      <Header 
        filters={filters} 
        setFilters={setFilters} 
        options={filterOptions} 
        onRefresh={() => loadData(true)}
        totalCount={filteredData.length}
        isRefreshing={isRefreshing}
        lastSync={lastSync}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"> {/* ITEMS-STRETCH UNTUK PENYELARASAN */}
        {/* SIDEBAR (KIRI - 4 KOLOM) */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full">
          {/* NAVIGASI MENU HALAMAN */}
          <SidebarNav activePage={activePage} onPageChange={setActivePage} />
          
          <div className="h-[350px]">
            <SummaryPanel data={rawData} />
          </div>
          
          {/* REKAP PETUGAS - Sejajar di bawah dengan DataTable (h-[600px]) */}
          <div className="h-[600px] flex-grow">
            <PetugasSummaryPanel data={rawData} />
          </div>
        </div>
        
        {/* MAIN CONTENT (KANAN - 8 KOLOM) */}
        <div className="lg:col-span-8 h-full">
          {renderContent()}
        </div>
      </div>

      <footer className="flex justify-between items-center text-slate-500 text-[11px] font-black py-6 border-t border-slate-300 uppercase tracking-[0.2em]">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
          <span>UP3 BUKITTINGGI MONITORING v3.3</span>
        </div>
        <span>Performance Optimized System © {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
};

export default App;
