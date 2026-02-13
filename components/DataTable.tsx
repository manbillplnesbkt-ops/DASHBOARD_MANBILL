
import React, { useState, useMemo, useEffect } from 'react';
import { LPBData, FilterState } from '../types';
import { Activity, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Database, Cpu } from 'lucide-react';

interface DataTableProps {
  data: LPBData[];
  onRowClick: (item: LPBData) => void;
  selectedId: string | null;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const DataTable: React.FC<DataTableProps> = ({ data, onRowClick, selectedId, filters, setFilters }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50; 

  const columns = [
    { key: "UNIT", label: "UNIT" },
    { key: "IDPEL", label: "IDPEL" },
    { key: "PETUGAS", label: "PETUGAS" },
    { key: "VALIDASI", label: "VALIDASI" },
    { key: "TEGANGAN", label: "TEGANGAN" },
    { key: "ARUS", label: "ARUS" },
    { key: "COSPHI", label: "COSPHI" },
    { key: "TARIF INDEX", label: "TARIF INDEX" },
    { key: "POWER LIMIT", label: "POWER LIMIT" },
    { key: "KWH KUMULATIF", label: "KWH KUMULATIF" },
    { key: "INDIKATOR", label: "INDIKATOR" },
    { key: "SISA KWH", label: "SISA KWH" },
    { key: "TEMPER", label: "TEMPER" },
    { key: "TUTUP METER", label: "TUTUP METER" },
    { key: "SEGEL", label: "SEGEL" },
    { key: "LCD", label: "LCD" },
    { key: "KEYPAD", label: "KEYPAD" },
    { key: "JML TERMINAL", label: "JML TERMINAL" }
  ];

  const totalPages = Math.ceil(data.length / rowsPerPage);
  
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [data.length, filters.validasi]);

  return (
    <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden flex flex-col h-full shadow-sm fade-in">
      {/* Header Tabel */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-950 rounded-2xl text-white shadow-xl">
             <Activity size={20} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight uppercase italic">Penjelajah Basis Data</h2>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mt-1.5">Stream Operasional 126K+</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Navigasi Halaman */}
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

          {/* Filter Validasi */}
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
        </div>
      </div>
      
      {/* Container Tabel Utama */}
      <div className="overflow-auto flex-1 bg-slate-50/30">
        <table className="w-full text-left border-collapse table-fixed min-w-[2000px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase font-black tracking-[0.15em] border-b border-white/5">
              {columns.map(col => (
                <th key={col.key} className="px-6 py-5 whitespace-nowrap bg-slate-950">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-[11px] font-bold">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-40 text-center">
                  <div className="flex flex-col items-center gap-5 text-slate-300">
                    <Database size={64} className="opacity-20" />
                    <p className="font-extrabold uppercase tracking-[0.3em] text-slate-400">Database Engine Kosong</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
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
                  <td className="px-6 py-4 font-mono-tech font-bold text-indigo-700">{row.IDPEL}</td>
                  <td className="px-6 py-4 uppercase text-slate-900 truncate">{row.PETUGAS}</td>
                  <td className="px-6 py-4">
                    <span className={`status-badge ${row.VALIDASI === 'VALID' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {row.VALIDASI === 'VALID' ? 'VALID' : 'ANOMALI'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono-tech text-slate-600">{row.TEGANGAN}V</td>
                  <td className="px-6 py-4 font-mono-tech text-slate-600">{row.ARUS}A</td>
                  <td className="px-6 py-4 font-mono-tech text-slate-600">{row.COSPHI}</td>
                  <td className="px-6 py-4 font-mono-tech text-slate-900">{row["TARIF INDEX"]}</td>
                  <td className="px-6 py-4 font-mono-tech font-bold text-slate-900">{row["POWER LIMIT"]}</td>
                  <td className="px-6 py-4 font-mono-tech text-slate-500">{row["KWH KUMULATIF"]}</td>
                  <td className="px-6 py-4 uppercase text-slate-500">{row.INDIKATOR}</td>
                  <td className="px-6 py-4 font-mono-tech font-bold text-orange-600">{row["SISA KWH"]}</td>
                  <td className="px-6 py-4 font-mono-tech text-slate-500">{row.TEMPER}</td>
                  <td className="px-6 py-4 uppercase text-slate-400">{row["TUTUP METER"]}</td>
                  <td className="px-6 py-4 uppercase text-slate-400">{row.SEGEL}</td>
                  <td className="px-6 py-4 uppercase text-slate-400">{row.LCD}</td>
                  <td className="px-6 py-4 uppercase text-slate-400">{row.KEYPAD}</td>
                  <td className="px-6 py-4 font-mono-tech text-slate-900">{row["JML TERMINAL"]}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer Status Dashboard */}
      <div className="p-4 bg-slate-950 flex justify-between items-center text-[10px] text-slate-500 font-black px-10 uppercase tracking-[0.2em] shrink-0">
         <div className="flex items-center gap-10">
            <span className="flex items-center gap-3 text-white/80">
              <Database size={14} className="text-orange-500"/>
              AGREGAT DATA: {data.length.toLocaleString()} NODE
            </span>
            <span className="flex items-center gap-3 text-emerald-400">
               <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div> 
               SYSTEM HEALTH: OPTIMAL
            </span>
         </div>
         <div className="flex items-center gap-3 text-indigo-400 italic">
            <Cpu size={14}/> ENGINE v7.5.SCROLL ACTIVE
         </div>
      </div>
    </div>
  );
};

export default React.memo(DataTable);
