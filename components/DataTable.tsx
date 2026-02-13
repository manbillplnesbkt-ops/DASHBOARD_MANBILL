
import React, { useState, useMemo, useEffect } from 'react';
import { LPBData, FilterState } from '../types';
import { Activity, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Database, Cpu, Table as TableIcon } from 'lucide-react';

interface DataTableProps {
  data: LPBData[];
  onRowClick: (item: LPBData) => void;
  selectedId: string | null;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  isInvoiceMode?: boolean;
  selectedPetugas?: string | null;
  onPetugasSelect?: (petugas: string) => void;
}

interface StaffRecap {
  petugas: string;
  unit: string;
  totalWo: number;
  totalReal: number;
  dates: Record<string, { m: number, o: number, j: number, t: number }>;
}

const DataTable: React.FC<DataTableProps> = ({ 
  data, onRowClick, selectedId, filters, setFilters, isInvoiceMode = false, 
  selectedPetugas, onPetugasSelect 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = isInvoiceMode ? 100 : 50; 

  // Ambil tanggal-tanggal unik yang tersedia di database harian
  const uniqueDates = useMemo(() => {
    if (!isInvoiceMode) return [];
    const dates = new Set<string>();
    data.forEach(item => {
      if (item.TANGGAL) dates.add(String(item.TANGGAL));
    });
    // Urutkan tanggal secara alfabetis/kronologis
    return Array.from(dates).sort((a, b) => a.localeCompare(b, undefined, {numeric: true}));
  }, [data, isInvoiceMode]);

  // Agregasi Data untuk mode Invoice secara Harian
  const aggregatedData = useMemo(() => {
    if (!isInvoiceMode) return [];

    const groups: Record<string, StaffRecap> = {};

    data.forEach(item => {
      const p = item.PETUGAS || 'TIDAK DIKETAHUI';
      const u = item.UNIT || '-';
      const key = `${p}-${u}`;

      if (!groups[key]) {
        groups[key] = {
          petugas: p,
          unit: u,
          totalWo: 0,
          totalReal: 0,
          dates: uniqueDates.reduce((acc, d) => ({ ...acc, [d]: { m: 0, o: 0, j: 0, t: 0 } }), {})
        };
      }

      // Menggunakan kolom TANGGAL dari database
      const tgl = String(item.TANGGAL || '');
      
      const mVal = item.LUNAS_MANDIRI || 0;
      const oVal = item.LUNAS_OFFLINE || 0;
      const jVal = item.JANJI_BAYAR || 0;
      const tVal = mVal + oVal + jVal;

      groups[key].totalWo += (item.TOTALLEMBAR || 0);
      groups[key].totalReal += tVal;

      if (tgl && groups[key].dates[tgl]) {
        groups[key].dates[tgl].m += mVal;
        groups[key].dates[tgl].o += oVal;
        groups[key].dates[tgl].j += jVal;
        groups[key].dates[tgl].t += tVal;
      }
    });

    return Object.values(groups).sort((a, b) => b.totalWo - a.totalWo);
  }, [data, isInvoiceMode, uniqueDates]);

  const displayData = isInvoiceMode ? aggregatedData : data;
  const totalPages = Math.ceil(displayData.length / rowsPerPage);
  
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return displayData.slice(start, start + rowsPerPage);
  }, [displayData, currentPage, rowsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [data.length, filters.validasi, isInvoiceMode]);

  const renderNormalHeader = () => (
    <thead className="sticky top-0 z-10">
      <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase font-black tracking-[0.15em] border-b border-white/5">
        <th className="px-6 py-5 w-[150px] bg-slate-950">UNIT</th>
        <th className="px-6 py-5 w-[180px] bg-slate-950">IDPEL</th>
        <th className="px-6 py-5 w-[250px] bg-slate-950">PETUGAS</th>
        <th className="px-6 py-5 w-[120px] bg-slate-950 text-center">VALIDASI</th>
        <th className="px-6 py-5 w-[100px] bg-slate-950 text-center">TEGANGAN</th>
        <th className="px-6 py-5 w-[100px] bg-slate-950 text-center">ARUS</th>
        <th className="px-6 py-5 w-[150px] bg-slate-950 text-center">SISA KWH</th>
        <th className="px-6 py-5 w-[200px] bg-slate-950">KWH KUMULATIF</th>
        <th className="px-6 py-5 w-[150px] bg-slate-950">INDIKATOR</th>
        <th className="px-6 py-5 w-[100px] bg-slate-950">RELAY</th>
      </tr>
    </thead>
  );

  const renderInvoiceHeader = () => (
    <thead className="sticky top-0 z-10 bg-slate-950 text-[9px] font-black text-white uppercase border-b-2 border-slate-800">
      <tr>
        <th rowSpan={2} className="px-4 py-4 border-r border-slate-800 bg-slate-950 w-[200px]">PETUGAS</th>
        <th rowSpan={2} className="px-4 py-4 border-r border-slate-800 bg-slate-950 w-[100px]">UNIT</th>
        <th rowSpan={2} className="px-4 py-4 border-r border-slate-800 bg-slate-950 w-[100px] text-center">TOTAL WO</th>
        <th rowSpan={2} className="px-4 py-4 border-r border-slate-800 bg-slate-950 w-[120px] text-center text-emerald-400">TOTAL REALISASI</th>
        
        {uniqueDates.map((tgl, idx) => (
          <th key={tgl} colSpan={4} className={`px-2 py-3 border-r border-slate-800 text-center text-[10px] tracking-widest ${idx % 2 === 0 ? 'bg-indigo-900/40' : 'bg-slate-900'}`}>
            Tanggal {tgl}
          </th>
        ))}
      </tr>
      <tr className="bg-slate-900/50 text-slate-400 text-[8px]">
        {uniqueDates.map(tgl => (
          <React.Fragment key={tgl}>
            <th className="px-2 py-2 border-r border-slate-800 text-center w-[75px]">MANDIRI</th>
            <th className="px-2 py-2 border-r border-slate-800 text-center w-[75px]">OFFLINE</th>
            <th className="px-2 py-2 border-r border-slate-800 text-center w-[75px]">JANJI</th>
            <th className="px-3 py-2 border-r border-slate-800 text-center w-[85px] text-white font-black bg-white/5">TOTAL</th>
          </React.Fragment>
        ))}
      </tr>
    </thead>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden flex flex-col h-full shadow-sm fade-in">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-950 rounded-2xl text-white shadow-xl">
             {isInvoiceMode ? <TableIcon size={20} /> : <Activity size={20} />}
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight uppercase italic">
              {isInvoiceMode ? 'Rekapitulasi Kinerja Harian' : 'Penjelajah Basis Data'}
            </h2>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mt-1.5">
              {isInvoiceMode ? 'Daily Performance Engine' : 'Stream Operasional Real-time'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1.5">
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2.5 hover:bg-white hover:shadow-md disabled:opacity-20 rounded-xl transition-all"><ChevronsLeft size={18} /></button>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2.5 hover:bg-white hover:shadow-md disabled:opacity-20 rounded-xl transition-all"><ChevronLeft size={18} /></button>
            
            <div className="flex items-center px-6 border-x border-slate-200">
               <span className="text-xs font-black text-slate-400 mr-3 uppercase tracking-widest">HAL</span>
               <input 
                 type="number" 
                 value={currentPage} 
                 onChange={(e) => {
                   const val = parseInt(e.target.value);
                   if (val >= 1 && val <= totalPages) setCurrentPage(val);
                 }}
                 className="w-14 text-sm font-black text-center bg-white border-2 border-slate-200 rounded-xl p-1.5 h-9 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
               />
               <span className="text-xs font-black text-slate-400 ml-3 uppercase tracking-widest">DARI {totalPages.toLocaleString() || 1}</span>
            </div>

            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2.5 hover:bg-white hover:shadow-md disabled:opacity-20 rounded-xl transition-all"><ChevronRight size={18} /></button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0} className="p-2.5 hover:bg-white hover:shadow-md disabled:opacity-20 rounded-xl transition-all"><ChevronsRight size={18} /></button>
          </div>

          {!isInvoiceMode && (
            <div className="flex items-center gap-3 bg-slate-900 text-white rounded-2xl px-5 py-2.5 shadow-lg">
              <Filter size={16} className="text-orange-500" />
              <select 
                value={filters.validasi}
                onChange={(e) => setFilters(prev => ({ ...prev, validasi: e.target.value }))}
                className="bg-transparent border-none text-xs font-extrabold focus:ring-0 outline-none cursor-pointer uppercase p-0 pr-6"
              >
                <option value="" className="text-slate-900">FILTER VALIDASI</option>
                <option value="VALID" className="text-slate-900">LAPORAN VALID</option>
                <option value="TIDAK VALID" className="text-slate-900">ANOMALI TERDETEKSI</option>
              </select>
            </div>
          )}
        </div>
      </div>
      
      <div className="overflow-auto flex-1 bg-slate-50/30 scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          {isInvoiceMode ? renderInvoiceHeader() : renderNormalHeader()}
          
          <tbody className="text-[10px] font-bold">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={isInvoiceMode ? (4 + uniqueDates.length * 4) : 10} className="p-40 text-center">
                  <div className="flex flex-col items-center gap-5 text-slate-300">
                    <Database size={64} className="opacity-20" />
                    <p className="font-extrabold uppercase tracking-[0.3em] text-slate-400">Database Engine Kosong</p>
                  </div>
                </td>
              </tr>
            ) : isInvoiceMode ? (
              (paginatedData as StaffRecap[]).map((row, idx) => (
                <tr 
                  key={`${row.petugas}-${row.unit}-${idx}`} 
                  onClick={() => onPetugasSelect?.(row.petugas)}
                  className={`
                    border-b border-slate-100 hover:bg-indigo-50/50 transition-colors cursor-pointer
                    ${selectedPetugas === row.petugas ? 'bg-indigo-100/80 ring-2 ring-inset ring-indigo-500/30' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}
                  `}
                >
                  <td className="px-4 py-3 font-black text-slate-900 uppercase border-r border-slate-100 sticky left-0 bg-inherit z-[5]">{row.petugas}</td>
                  <td className="px-4 py-3 text-slate-500 uppercase border-r border-slate-100">{row.unit}</td>
                  <td className="px-4 py-3 text-center font-mono text-slate-600 border-r border-slate-100">{row.totalWo}</td>
                  <td className="px-4 py-3 text-center font-mono text-emerald-700 bg-emerald-50/30 border-r border-slate-100 font-black">{row.totalReal}</td>
                  
                  {uniqueDates.map(tgl => (
                    <React.Fragment key={tgl}>
                      <td className="px-2 py-3 text-center font-mono text-indigo-700 border-r border-slate-50">{row.dates[tgl].m || '-'}</td>
                      <td className="px-2 py-3 text-center font-mono text-blue-700 border-r border-slate-50">{row.dates[tgl].o || '-'}</td>
                      <td className="px-2 py-3 text-center font-mono text-amber-700 border-r border-slate-50">{row.dates[tgl].j || '-'}</td>
                      <td className="px-2 py-3 text-center font-mono text-slate-900 font-black bg-slate-100/30 border-r border-slate-100">{row.dates[tgl].t || '-'}</td>
                    </React.Fragment>
                  ))}
                </tr>
              ))
            ) : (
              (paginatedData as LPBData[]).map((row, idx) => (
                <tr 
                  key={row.IDPEL + idx} 
                  onClick={() => onRowClick(row)}
                  className={`
                    cursor-pointer transition-all border-b border-slate-100 group
                    ${selectedId === row.IDPEL ? 'bg-indigo-50/90 ring-2 ring-inset ring-indigo-500/20' : 'hover:bg-white'}
                    ${idx % 2 === 0 ? 'bg-slate-50/20' : 'bg-white'}
                  `}
                >
                  <td className="px-6 py-4 uppercase text-slate-500">{row.UNIT}</td>
                  <td className="px-6 py-4 font-mono font-bold text-indigo-700">{row.IDPEL}</td>
                  <td className="px-6 py-4 uppercase text-slate-900 truncate">{row.PETUGAS}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`status-badge ${row.VALIDASI === 'VALID' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {row.VALIDASI === 'VALID' ? 'VALID' : 'ANOMALI'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-slate-600">{row.TEGANGAN}V</td>
                  <td className="px-6 py-4 text-center font-mono text-slate-600">{row.ARUS}A</td>
                  <td className="px-6 py-4 text-center font-mono font-bold text-orange-600">{row["SISA KWH"]}</td>
                  <td className="px-6 py-4 font-mono text-slate-500">{row["KWH KUMULATIF"]}</td>
                  <td className="px-6 py-4 uppercase text-slate-500">{row.INDIKATOR}</td>
                  <td className="px-6 py-4 uppercase text-slate-400">{row.RELAY || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 bg-slate-950 flex justify-between items-center text-[10px] text-slate-500 font-black px-10 uppercase tracking-[0.2em] shrink-0">
         <div className="flex items-center gap-10">
            <span className="flex items-center gap-3 text-white/80">
              <Database size={14} className="text-orange-500"/>
              {isInvoiceMode ? 'DAILY PERFORMANCE RECAP ACTIVE' : `TOTAL DATA: ${data.length.toLocaleString()} NODE`}
            </span>
            <span className="flex items-center gap-3 text-emerald-400">
               <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div> 
               SYSTEM HEALTH: OPTIMAL
            </span>
         </div>
         <div className="flex items-center gap-3 text-indigo-400 italic">
            <Cpu size={14}/> ENGINE v7.5.DAILY ACTIVE
         </div>
      </div>
    </div>
  );
};

export default React.memo(DataTable);
