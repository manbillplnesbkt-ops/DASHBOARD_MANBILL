
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchTableDataFromSupabase, fetchDataByBounds } from './services/supabaseService';
import { LPBData, FilterState, AdminAuthState } from './types';
import Header from './components/Header';
import InfoPanel from './components/InfoPanel';
import MapPanel from './components/MapPanel';
import DataTable from './components/DataTable';
import SummaryPanel from './components/SummaryPanel';
import PetugasSummaryPanel from './components/PetugasSummaryPanel';
import DailyRealizationChart from './components/DailyRealizationChart';
import SidebarNav from './components/SidebarNav';
import PagePlaceholder from './components/PagePlaceholder';
import AdminPanel from './components/AdminPanel';
import { Loader2, LockKeyhole, ShieldCheck, Database, Wifi, Cpu, Zap, Activity } from 'lucide-react';

const ADMIN_PASSWORD = "Adminmanbill";

const App: React.FC = () => {
  const [lpbData, setLpbData] = useState<LPBData[]>([]);
  const [invoiceData, setInvoiceData] = useState<LPBData[]>([]);
  const [mapData, setMapData] = useState<LPBData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Menginisialisasi Sistem Utama...');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState<number>(0);
  const [selectedItem, setSelectedItem] = useState<LPBData | null>(null);
  const [selectedPetugas, setSelectedPetugas] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<string>('DASHBOARD');
  const [adminAuth, setAdminAuth] = useState<AdminAuthState>({ isAuthenticated: false });
  const [passwordInput, setPasswordInput] = useState('');
  
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

  const loadGlobalData = async (force = false) => {
    if (force) setIsRefreshing(true);
    setLoadingStatus('Sinkronisasi Data Pusat...');
    try {
      // Load Prabayar (lpb_data)
      const lpbResult = await fetchTableDataFromSupabase('lpb_data', force);
      setLpbData(lpbResult.data);
      
      // Load Invoice (invoice_data)
      const invoiceResult = await fetchTableDataFromSupabase('invoice_data', force);
      setInvoiceData(invoiceResult.data);
      
      setLastSync(Date.now());
    } catch (err) {
      console.error('Pemuatan data global gagal:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleMapBoundsChange = useCallback(async (bounds: { minLat: number, maxLat: number, minLng: number, maxLng: number }) => {
    try {
      const tableName = activePage === 'TAGIHAN' ? 'invoice_data' : 'lpb_data';
      const points = await fetchDataByBounds(tableName, bounds);
      setMapData(points);
    } catch (err) {
      console.error('Gagal mengambil titik peta:', err);
    }
  }, [activePage]);

  useEffect(() => {
    loadGlobalData();
    const interval = setInterval(() => loadGlobalData(true), 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const activeRawData = useMemo(() => {
    return activePage === 'TAGIHAN' ? invoiceData : lpbData;
  }, [activePage, lpbData, invoiceData]);

  const filteredAllData = useMemo(() => {
    const { blth, unit, PETUGAS, validasi } = debouncedFilters;
    if (!blth && !unit && !PETUGAS && !validasi) return activeRawData;
    const searchTerm = PETUGAS.toLowerCase();
    return activeRawData.filter(item => {
      if (blth && item.BLTH !== blth) return false;
      if (unit && item.UNIT !== unit) return false;
      if (validasi && item.VALIDASI !== validasi) return false;
      if (searchTerm && !item.PETUGAS?.toLowerCase().includes(searchTerm)) return false;
      return true;
    });
  }, [activeRawData, debouncedFilters]);

  const filteredMapData = useMemo(() => {
    const { blth, unit, PETUGAS, validasi } = debouncedFilters;
    if (!blth && !unit && !PETUGAS && !validasi) return mapData;
    const searchTerm = PETUGAS.toLowerCase();
    return mapData.filter(item => {
      if (blth && item.BLTH !== blth) return false;
      if (unit && item.UNIT !== unit) return false;
      if (validasi && item.VALIDASI !== validasi) return false;
      if (searchTerm && !item.PETUGAS?.toLowerCase().includes(searchTerm)) return false;
      return true;
    });
  }, [mapData, debouncedFilters]);

  const filterOptions = useMemo(() => {
    return {
      blth: Array.from(new Set(activeRawData.map(d => d.BLTH))).filter(Boolean).sort(),
      unit: Array.from(new Set(activeRawData.map(d => d.UNIT))).filter(Boolean).sort(),
      pegawai: []
    };
  }, [activeRawData]);

  const activePageLabel = useMemo(() => {
    switch (activePage) {
      case 'DASHBOARD': return 'PRABAYAR';
      case 'TAGIHAN': return 'INVOICE';
      case 'PEMUTUSAN': return 'PEMUTUSAN';
      case 'P NOL': return 'P-NOL';
      case 'PIUTANG': return 'PIUTANG';
      case 'KINERJA': return 'KINERJA';
      case 'ADMIN': return 'ADMIN';
      default: return 'SISTEM';
    }
  }, [activePage]);

  const activeTabCount = filteredAllData.length;

  const handleRowClick = useCallback((item: LPBData) => {
    setSelectedItem(item);
  }, []);

  const handlePetugasSelect = useCallback((petugasName: string) => {
    setSelectedPetugas(petugasName === selectedPetugas ? null : petugasName);
  }, [selectedPetugas]);

  if (loading && lpbData.length === 0 && invoiceData.length === 0) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center gap-10 text-white">
        <div className="relative">
          <div className="w-32 h-32 border-4 border-indigo-500/20 rounded-full animate-ping absolute"></div>
          <div className="w-32 h-32 border-t-4 border-indigo-500 rounded-full animate-spin"></div>
          <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" size={48} />
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-[0.5em] uppercase text-indigo-400">MENGAMBIL DATA</h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.3em] mt-5 animate-pulse">
            {loadingStatus}
          </p>
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="grid grid-cols-12 gap-6 max-w-[1920px] mx-auto w-full pb-10 items-start">
      {/* Kolom Kiri: Rekapitulasi & Kinerja */}
      <div className="col-span-12 xl:col-span-3 flex flex-col gap-6 h-fit">
        <SummaryPanel data={activeRawData} isInvoiceMode={activePage === 'TAGIHAN'} />
        <PetugasSummaryPanel data={activeRawData} isInvoiceMode={activePage === 'TAGIHAN'} />
      </div>

      {/* Kolom Kanan: Visual Utama & Tabel */}
      <div className="col-span-12 xl:col-span-9 flex flex-col gap-6">
        <div className="grid grid-cols-12 gap-6 items-start">
          {activePage === 'TAGIHAN' ? (
            <>
              <div className="col-span-12 lg:col-span-8 h-[500px]">
                <DailyRealizationChart 
                  data={activeRawData} 
                  selectedPetugas={selectedPetugas} 
                  onClearSelection={() => setSelectedPetugas(null)} 
                />
              </div>
              <div className="col-span-12 lg:col-span-4 h-[500px]">
                <InfoPanel data={null} allData={activeRawData} isInvoiceMode={true} />
              </div>
            </>
          ) : (
            <>
              <div className="col-span-12 lg:col-span-8 h-[500px]">
                <MapPanel data={filteredMapData} selectedItem={selectedItem} onBoundsChange={handleMapBoundsChange} />
              </div>
              <div className="col-span-12 lg:col-span-4 h-[500px]">
                <InfoPanel data={selectedItem} allData={activeRawData} isInvoiceMode={false} />
              </div>
            </>
          )}
        </div>
        
        <div className="h-[700px] w-full">
          <DataTable 
            data={filteredAllData} 
            onRowClick={handleRowClick} 
            selectedId={selectedItem?.IDPEL || null} 
            filters={filters} 
            setFilters={setFilters} 
            isInvoiceMode={activePage === 'TAGIHAN'}
            selectedPetugas={selectedPetugas}
            onPetugasSelect={handlePetugasSelect}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-slate-100 flex flex-col">
      <div className="sticky top-0 z-[1002]">
        <SidebarNav activePage={activePage} onPageChange={(p) => { setActivePage(p); setSelectedPetugas(null); }} />
      </div>
      
      <div className="bg-white border-b border-slate-200 shadow-sm z-[1001] sticky top-16">
        <div className="max-w-[1920px] mx-auto px-8 py-4">
          <Header 
            filters={filters} 
            setFilters={setFilters} 
            options={filterOptions} 
            onRefresh={() => loadGlobalData(true)} 
            totalCount={activeTabCount} 
            isRefreshing={isRefreshing} 
            lastSync={lastSync}
            activePageName={activePageLabel}
          />
        </div>
      </div>

      <main className="flex-1 p-6 lg:p-8 bg-slate-50/50">
        {(activePage === 'DASHBOARD' || activePage === 'TAGIHAN') ? renderDashboard() : 
         activePage === 'ADMIN' ? (adminAuth.isAuthenticated ? <AdminPanel onBack={() => setActivePage('DASHBOARD')} onRefreshData={() => loadGlobalData(true)} /> : 
           <div className="h-[calc(100vh-200px)] flex items-center justify-center">
             <form onSubmit={(e) => {e.preventDefault(); passwordInput === ADMIN_PASSWORD ? setAdminAuth({isAuthenticated:true}) : alert('Password Salah')}} className="bg-white p-12 rounded-[48px] border border-slate-200 shadow-2xl w-full max-md space-y-8 fade-in">
                <div className="flex flex-col items-center gap-5 text-center">
                  <div className="p-6 bg-slate-950 text-indigo-400 rounded-[32px] shadow-2xl"><LockKeyhole size={56} /></div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tight">Otorisasi Sistem</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Masukkan Kode Akses Administratif</p>
                </div>
                <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-center font-black text-xl outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300" placeholder="••••••••" />
                <button type="submit" className="w-full py-6 bg-slate-950 text-white rounded-3xl font-black uppercase text-sm tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-2xl shadow-slate-900/20 active:scale-95">Verifikasi Identitas</button>
             </form>
           </div>
         ) : <PagePlaceholder title={activePageLabel} />}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-[1920px] mx-auto px-10 py-5 flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-[0.15em]">
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-3 text-indigo-600">
              <Activity size={16}/> {activeTabCount.toLocaleString()} NODE TERDATA
            </span>
            <span className="flex items-center gap-3">
              <Wifi size={16} className="text-emerald-500" /> SINKRONISASI CLOUD AKTIF
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="opacity-40 font-black tracking-tighter">SECURE TUNNEL: TLS 1.3</span>
            <span className="text-slate-900 bg-slate-100 px-4 py-2 rounded-full font-black">BUILD v7.5.SCROLL</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
