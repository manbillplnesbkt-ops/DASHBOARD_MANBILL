
import React, { useState, useMemo } from 'react';
import { LPBData, FilterState } from '../types';
import { Activity, Filter, UserRound, ChevronLeft, ChevronRight } from 'lucide-react';

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
    "IDPEL", "NAMA", "PETUGAS", "TEGANGAN", "ARUS", "COSPHI", "TARIF INDEX", "POWER LIMIT", 
    "KWH KUMULATIF", "INDIKATOR", "SISA KWH", "TEMPER"
  ];

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, currentPage]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [data.length, filters]);

  return (
    <div className="bg-white border-2 border-slate-300 rounded-2xl overflow-hidden flex flex-col h-[600px] shadow-xl">
      <div className="p-6 border-b-2 border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-4">
          <div className="p-2.5 bg-indigo-700 rounded-xl text-white shadow-lg shadow-indigo-100">
             <Activity size={22} />
          </div>
          TECHNICAL MONITORING LOG
        </h2>
        
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3 bg-white border-2 border-slate-200 rounded-2xl p-1.5 shadow-sm">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 hover:bg-slate-100 disabled:opacity-20 text-slate-700 rounded-xl transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-[12px] font-black text-slate-900 uppercase px-4 tracking-[0.2em]">
              PAGE {currentPage} <span className="text-slate-400">/</span> {totalPages || 1}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 hover:bg-slate-100 disabled:opacity-20 text-slate-700 rounded-xl transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3 bg-white border-2 border-slate-200 rounded-2xl px-5 py-2.5 shadow-sm">
            <Filter size={18} className="text-indigo-700" />
            <select 
              value={filters.validasi}
              onChange={(e) => setFilters(prev => ({ ...prev, validasi: e.target.value }))}
              className="bg-transparent border-none text-[12px] font-black focus:ring-0 text-slate-900 outline-none cursor-pointer uppercase tracking-widest"
            >
              <option value="">STATUS VALIDASI</option>
              <option value="VALID">VALID</option>
              <option value="TIDAK VALID">TIDAK VALID</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="overflow-auto flex-1 scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-max">
          <thead className="sticky top-0 z-10 bg-slate-900 text-slate-100 text-[10px] uppercase font-black tracking-[0.2em] border-b-2 border-slate-800">
            <tr>
              {columns.map(col => (
                <th key={col} className="p-5">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-[12px]">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-16 text-center text-slate-500 font-black italic uppercase tracking-widest opacity-50">
                  No records matching the current filters.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr 
                  key={row.IDPEL + idx} 
                  onClick={() => onRowClick(row)}
                  className={`
                    cursor-pointer transition-all border-b border-slate-100 
                    ${selectedId === row.IDPEL ? 'bg-indigo-50/50 border-l-[6px] border-l-indigo-700' : 'hover:bg-slate-50'}
                  `}
                >
                  <td className="p-5 font-mono font-black text-slate-600 tracking-tighter">{row.IDPEL}</td>
                  <td className="p-5 font-black text-slate-900">
                    <div className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${row.VALIDASI === 'VALID' ? 'bg-emerald-600' : 'bg-rose-600'}`}></span>
                      {row.NAMA}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2.5 text-[11px] text-indigo-800 font-black uppercase tracking-tight">
                      <UserRound size={14} className="text-slate-400" />
                      {row.PETUGAS || '-'}
                    </div>
                  </td>
                  <td className="p-5 font-black text-slate-700">{row.TEGANGAN}V</td>
                  <td className="p-5 font-black text-slate-700">{row.ARUS}A</td>
                  <td className="p-5 font-black text-slate-700">{row.COSPHI}</td>
                  <td className="p-5 text-slate-500 font-bold">{row["TARIF INDEX"]}</td>
                  <td className="p-5 text-slate-500 font-bold">{row["POWER LIMIT"]}</td>
                  <td className="p-5 font-mono font-bold text-slate-600">{row["KWH KUMULATIF"]}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${row.INDIKATOR === 'NORMAL' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'}`}>
                      {row.INDIKATOR}
                    </span>
                  </td>
                  <td className="p-5 font-black text-slate-900 text-sm">{row["SISA KWH"]}</td>
                  <td className="p-5 text-slate-500 font-bold">{row.TEMPER}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-5 bg-slate-900 border-t-2 border-slate-800 flex justify-between items-center text-[11px] text-slate-400 font-black px-8 tracking-widest uppercase">
         <span>DISPLAYING {paginatedData.length.toLocaleString()} <span className="text-slate-600">/</span> {data.length.toLocaleString()} GLOBAL RECORDS</span>
         <div className="flex gap-6">
            <div className="flex items-center gap-2.5 text-emerald-500 font-black">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div> VALID
            </div>
            <div className="flex items-center gap-2.5 text-rose-500 font-black">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-600 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div> TIDAK VALID
            </div>
         </div>
      </div>
    </div>
  );
};

export default React.memo(DataTable);
