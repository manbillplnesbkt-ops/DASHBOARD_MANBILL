
import React from 'react';
import { LPBData } from '../types';
import { Users, TrendingUp } from 'lucide-react';

interface PetugasSummaryPanelProps {
  data: LPBData[];
}

const PetugasSummaryPanel: React.FC<PetugasSummaryPanelProps> = ({ data }) => {
  const summaryMap = data.reduce((acc: Record<string, { total: number, valid: number, invalid: number }>, item) => {
    const petugas = item.PETUGAS || 'UNKNOWN';
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
      <div className="p-3 bg-slate-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-600 rounded-lg text-white shadow-md shadow-indigo-900/20">
            <Users size={16} />
          </div>
          <h2 className="text-[11px] font-black text-white uppercase tracking-widest leading-none">PETUGAS PERFORMANCE</h2>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-[8px] font-black text-slate-500 uppercase">Leaderboard Display</span>
           <TrendingUp size={12} className="text-orange-500" />
        </div>
      </div>
      
      <div className="flex-1 p-3 flex flex-col overflow-hidden bg-white">
        <div className="w-full h-full border-2 border-slate-200 rounded-xl overflow-hidden flex flex-col bg-white shadow-sm">
          <div className="grid grid-cols-12 bg-slate-50 border-b-2 border-slate-200 text-[8px] font-black text-slate-500 uppercase tracking-[0.15em] py-2.5 px-4 shrink-0">
            <div className="col-span-5">PETUGAS NAME</div>
            <div className="col-span-2 text-center">TOTAL</div>
            <div className="col-span-2 text-center text-emerald-600">VALID</div>
            <div className="col-span-3 text-center text-rose-600">INVALID</div>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {sortedPetugas.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-[10px] italic uppercase font-black tracking-widest opacity-50">
                Awaiting Performance Records
              </div>
            ) : (
              sortedPetugas.map((name, idx) => (
                <div 
                  key={name} 
                  className={`
                    grid grid-cols-12 items-center px-4 py-3.5 text-[11px] font-black border-b border-slate-100 
                    hover:bg-indigo-50/50 transition-colors cursor-default
                    ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}
                  `}
                >
                  <div className="col-span-5 text-slate-900 truncate pr-2 uppercase tracking-tight flex items-center gap-2">
                    <span className={`
                      text-[9px] font-mono w-5 h-5 flex items-center justify-center rounded-md shrink-0
                      ${idx < 3 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}
                    `}>
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="truncate">{name}</span>
                  </div>
                  <div className="col-span-2 text-center text-indigo-700 font-mono text-[10px] bg-indigo-50/50 py-1 rounded-md">{summaryMap[name].total}</div>
                  <div className="col-span-2 text-center text-emerald-700 font-mono text-[10px]">{summaryMap[name].valid}</div>
                  <div className="col-span-3 text-center text-rose-700 font-mono text-[10px]">{summaryMap[name].invalid}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PetugasSummaryPanel);
