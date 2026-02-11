import React from 'react';
import { LPBData } from '../types';
import { Users, TrendingUp } from 'lucide-react';

interface PetugasSummaryPanelProps {
  data: LPBData[];
}

const PetugasSummaryPanel: React.FC<PetugasSummaryPanelProps> = ({ data }) => {
  const summaryMap = data.reduce((acc: Record<string, { total: number, valid: number, invalid: number }>, item) => {
    const petugas = item.PETUGAS || 'TIDAK TERIDENTIFIKASI';
    if (!acc[petugas]) {
      acc[petugas] = { total: 0, valid: 0, invalid: 0 };
    }
    acc[petugas].total++;
    if (item.VALIDASI === 'VALID') {
      acc[petugas].valid++;
    } else if (item.VALIDASI === 'TIDAK VALID') {
      acc[petugas].invalid++;
    }
    return acc;
  }, {} as Record<string, { total: number, valid: number, invalid: number }>);

  const sortedPetugas = Object.keys(summaryMap).sort((a, b) => summaryMap[b].total - summaryMap[a].total);

  return (
    <div className="bg-white border-2 border-slate-300 rounded-2xl flex flex-col overflow-hidden h-full shadow-lg">
      <div className="p-4 bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md">
            <Users size={20} />
          </div>
          <h2 className="text-sm font-black text-white uppercase tracking-widest">REKAP PETUGAS</h2>
        </div>
        <TrendingUp size={16} className="text-orange-500" />
      </div>
      
      <div className="flex-1 p-4 flex flex-col overflow-hidden bg-white">
        {sortedPetugas.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-[11px] font-black italic">
            NO PETUGAS DATA
          </div>
        ) : (
          <div className="w-full h-full border-2 border-slate-200 rounded-xl overflow-hidden flex flex-col bg-white">
            <div className="grid grid-cols-12 bg-slate-900 border-b border-slate-800 text-[9px] font-black text-slate-400 uppercase tracking-widest py-3 px-4">
              <div className="col-span-5">PETUGAS</div>
              <div className="col-span-2 text-center">TOTAL</div>
              <div className="col-span-2 text-center">VALID</div>
              <div className="col-span-3 text-center">INVALID</div>
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {sortedPetugas.map((name, idx) => (
                <div 
                  key={name} 
                  className={`grid grid-cols-12 items-center px-4 py-3 text-[11px] font-black border-b border-slate-100 hover:bg-indigo-50/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                >
                  <div className="col-span-5 text-slate-900 truncate pr-2 uppercase font-black">{name}</div>
                  <div className="col-span-2 text-center text-indigo-700 font-mono text-xs">
                    {summaryMap[name].total}
                  </div>
                  <div className="col-span-2 text-center text-emerald-700 font-mono text-xs">
                    {summaryMap[name].valid}
                  </div>
                  <div className="col-span-3 text-center text-rose-700 font-mono text-xs">
                    {summaryMap[name].invalid}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(PetugasSummaryPanel);