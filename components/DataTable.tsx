
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
    <div className="bg-white border-2 border-slate-300 rounded-2xl overflow-hidden flex flex-col h-full shadow-lg">
      <div className="p-3 border-b-2 border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50 shrink-0">
        <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <div className="p-1.5 bg-indigo-700 rounded-lg text-white shadow-md">
             <Activity size={16} />
          </div>
          TECHNICAL MONITORING LOG
        </h2>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border-2 border-slate-200 rounded-lg p-0.5 shadow-sm">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 hover:bg-slate-100 disabled:opacity-20 text-slate-700 rounded transition-all"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-[10px] font-black text-slate-900 uppercase px-2 tracking-tighter">
              {currentPage} / {totalPages || 1}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1 hover:bg-slate-100 disabled:opacity-20 text-slate-700 rounded transition-all"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-white border-2 border-slate-200 rounded-lg px-2 py-1 shadow-sm">
            <Filter size={12} className="text-indigo-700" />
            <select 
              value={filters.validasi}
              onChange={(e) => setFilters(prev => ({ ...prev, validasi: e.target.value }))}
              className="bg-transparent border-none text-[10px] font-black focus:ring-0 text-slate-900 outline-none cursor-pointer uppercase tracking-tighter p-0"
            >
              <option value="">ALL STATUS</option>
              <option value="VALID">VALID</option>
              <option value="TIDAK VALID">INVALID</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="overflow-auto flex-1 scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-max">
          <thead className="sticky top-0 z-10 bg-slate-900 text-slate-100 text-[9px] uppercase font-black tracking-widest border-b border-slate-800">
            <tr>
              {columns.map(col => (
                <th key={col} className="px-4 py-3">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-[11px]">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-10 text-center text-slate-400 font-black italic uppercase tracking-widest opacity-50">
                  No records found.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr 
                  key={row.IDPEL + idx} 
                  onClick={() => onRowClick(row)}
                  className={`
                    cursor-pointer transition-all border-b border-slate-50 
                    ${selectedId === row.IDPEL ? 'bg-indigo-50 border-l-[4px] border-l-indigo-700' : 'hover:bg-slate-50'}
                  `}
                >
                  <td className="px-4 py-2 font-mono font-black text-slate-600 tracking-tighter">{row.IDPEL}</td>
                  <td className="px-4 py-2 font-black text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shadow-sm shrink-0 ${row.VALIDASI === 'VALID' ? 'bg-emerald-600' : 'bg-rose-600'}`}></span>
                      <span className="truncate max-w-[150px]">{row.NAMA}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1.5 text-[10px] text-indigo-800 font-black uppercase truncate max-w-[120px]">
                      <UserRound size={12} className="text-slate-400 shrink-0" />
                      {row.PETUGAS || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-2 font-black text-slate-700">{row.TEGANGAN}V</td>
                  <td className="px-4 py-2 font-black text-slate-700">{row.ARUS}A</td>
                  <td className="px-4 py-2 font-black text-slate-700">{row.COSPHI}</td>
                  <td className="px-4 py-2 text-slate-500 font-bold">{row["TARIF INDEX"]}</td>
                  <td className="px-4 py-2 text-slate-500 font-bold">{row["POWER LIMIT"]}</td>
                  <td className="px-4 py-2 font-mono font-bold text-slate-600">{row["KWH KUMULATIF"]}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-tighter ${row.INDIKATOR === 'NORMAL' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'}`}>
                      {row.INDIKATOR}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-black text-slate-900">{row["SISA KWH"]}</td>
                  <td className="px-4 py-2 text-slate-500 font-bold">{row.TEMPER}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-2 bg-slate-900 border-t border-slate-800 flex justify-between items-center text-[9px] text-slate-400 font-black px-4 tracking-widest uppercase shrink-0">
         <span>DISPLAYING {paginatedData.length.toLocaleString()} / {data.length.toLocaleString()}</span>
         <div className="flex gap-4">
            <div className="flex items-center gap-2 text-emerald-500">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div> VALID
            </div>
            <div className="flex items-center gap-2 text-rose-500">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-600"></div> INVALID
            </div>
         </div>
      </div>
    </div>
  );
};

export default React.memo(DataTable);
