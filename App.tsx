
import React, { useState, useEffect, useMemo } from 'react';
import { fetchLPBDataFromD1 } from './services/d1Service';
import { LPBData, FilterState, AdminAuthState } from './types';
import Header from './components/Header';
import InfoPanel from './components/InfoPanel';
import MapPanel from './components/MapPanel';
import DataTable from './components/DataTable';
import SummaryPanel from './components/SummaryPanel';
import PetugasSummaryPanel from './components/PetugasSummaryPanel';
import SidebarNav from './components/SidebarNav';
import PagePlaceholder from './components/PagePlaceholder';
import AdminPanel from './components/AdminPanel';
import { Loader2, LockKeyhole, ShieldCheck } from 'lucide-react';

const ADMIN_PASSWORD = "Adminmanbill";

const App: React.FC = () => {
  const [rawData, setRawData] = useState<LPBData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState<number>(0);
  const [selectedItem, setSelectedItem] = useState<LPBData | null>(null);
  const [activePage, setActivePage] = useState<string>('DASHBOARD');
  const [adminAuth, setAdminAuth] = useState<AdminAuthState>({ isAuthenticated: false });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);
  
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
    if (force) {
      setIsRefreshing(true);
      if ('caches' in window) {
        await caches.delete('lpb_d1_cache_v3');
      }
    }
    
    const result = await fetchLPBDataFromD1(force);
    setRawData(result.data);
    setLastSync(result.timestamp);
    setLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 15 * 60 * 1000);
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

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setAdminAuth({ isAuthenticated: true, lastLogin: Date.now() });
      setAuthError(false);
    } else {
      setAuthError(true);
      setPasswordInput('');
    }
  };

  if (loading && rawData.length === 0) {
    return (
      <div className="h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 text-orange-700">
        <Loader2 className="animate-spin" size={64} />
        <p className="text-xl font-black tracking-widest animate-pulse uppercase">Connecting to Cloudflare D1...</p>
      </div>
    );
  }

  const renderAdminAuth = () => (
    <div className="h-full flex items-center justify-center bg-slate-100/50 p-4">
      <div className="bg-white border-2 border-slate-300 rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 bg-slate-900 rounded-2xl text-rose-500 shadow-xl shadow-slate-200">
            <LockKeyhole size={32} />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">ADMIN ACCESS</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">RESTRICTED AREA</p>
          </div>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Master Password</label>
            <input 
              type="password"
              autoFocus
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="••••••••••••"
              className={`
                w-full bg-slate-50 border-2 rounded-xl px-4 py-3 font-black text-center focus:outline-none transition-all
                ${authError ? 'border-rose-500 bg-rose-50 animate-shake' : 'border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10'}
              `}
            />
            {authError && <p className="text-[9px] font-black text-rose-600 uppercase text-center mt-2 tracking-tighter">Incorrect Password. Authorization Denied.</p>}
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg hover:bg-slate-800 transition-all active:scale-[0.97]"
          >
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="flex flex-col gap-3 h-full overflow-hidden">
      <div className="flex flex-row gap-3 h-[50%] min-h-[320px]">
        <div className="flex-[2.2] h-full">
          <SummaryPanel data={rawData} />
        </div>
        <div className="flex-[5.3] h-full">
          <MapPanel data={filteredData} selectedId={selectedItem?.IDPEL || null} />
        </div>
        <div className="flex-[2.5] h-full">
          <InfoPanel data={selectedItem} allData={rawData} />
        </div>
      </div>
      <div className="flex flex-row gap-3 h-[50%] min-h-[320px]">
        <div className="flex-[2.2] h-full">
          <PetugasSummaryPanel data={rawData} />
        </div>
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

  const renderActivePage = () => {
    switch (activePage) {
      case 'DASHBOARD':
        return renderDashboard();
      case 'ADMIN':
        return adminAuth.isAuthenticated ? (
          <AdminPanel 
            onBack={() => setActivePage('DASHBOARD')} 
            onRefreshData={() => loadData(true)} 
          />
        ) : renderAdminAuth();
      default:
        return <PagePlaceholder title={activePage} />;
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-100 flex flex-col overflow-hidden">
      <SidebarNav activePage={activePage} onPageChange={setActivePage} />
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
      <main className="flex-1 px-3 lg:px-4 pb-3 min-h-0">
        {renderActivePage()}
      </main>
      <footer className="flex justify-between items-center text-slate-500 text-[8px] font-black py-1 px-6 border-t border-slate-200 uppercase tracking-[0.2em] shrink-0 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
          <span>UP3 BUKITTINGGI MONITORING v5.1 D1-ENTERPRISE</span>
        </div>
        <div className="flex items-center gap-4">
           {adminAuth.isAuthenticated && (
             <span className="flex items-center gap-1 text-rose-600 font-black">
               <ShieldCheck size={10} /> ADMIN LOGGED IN
             </span>
           )}
           <span>Edge-Computing Optimized</span>
           <span className="text-slate-300">|</span>
           <span>© {new Date().getFullYear()} CORE SYSTEMS</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
