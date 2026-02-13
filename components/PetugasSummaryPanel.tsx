
import React from 'react';
import { LPBData } from '../types';
import { Users, TrendingUp } from 'lucide-react';

interface PetugasSummaryPanelProps {
  data: LPBData[];
  isInvoiceMode?: boolean;
}

interface PetugasMetrics {
  // Prabayar
  total: number;
  valid: number;
  invalid: number;
  // Invoice
  totalWo: number;
  lunasMandiri: number;
  lunasOffline: number;
  janjiBayar: number;
}

const PetugasSummaryPanel: React.FC<PetugasSummaryPanelProps> = ({ data, isInvoiceMode = false }) => {
  const summaryMap = data.reduce((acc: Record<string, PetugasMetrics>, item) => {
    const petugas = item.PETUGAS || 'TIDAK DIKETAHUI';
    if (!acc[petugas]) {
      acc[petugas] = { 
        total: 0, valid: 0, invalid: 0,
        totalWo: 0, lunasMandiri: 0, lunasOffline: 0, janjiBayar: 0 
      };
    }
    
    if (isInvoiceMode) {
      acc[petugas].totalWo += (item.TOTALLEMBAR || 0);
      acc[petugas].lunasMandiri += (item.LUNAS_MANDIRI || 0);
      acc[petugas].lunasOffline += (item.LUNAS_OFFLINE || 0);
      acc[petugas].janjiBayar += (item.JANJI_BAYAR || 0);
    } else {
      acc[petugas].total++;
      if (item.VALIDASI === 'VALID') acc[petugas].valid++;
      else if (item.VALIDASI === 'TIDAK VALID') acc[petugas].invalid++;
    }
    
    return acc;
  }, {} as Record<string, PetugasMetrics>);

  // Sort by Total WO (Invoice) or Total Count (Prabayar)
  const sortedPetugas = Object.keys(summaryMap).sort((a, b) => {
    if (isInvoiceMode) {
      return summaryMap[b].totalWo - summaryMap[a].totalWo;
    }
    return summaryMap[b].total - summaryMap[a].total;
  });

  return (
    <div className="bg-white border-2 border-slate-300 rounded-2xl flex flex-col overflow-hidden shadow-lg h-fit">
      <div className="p-3 bg-slate-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-600 rounded-lg text-white shadow-md shadow-indigo-900/20">
            <Users size={16} />
          </div>
          <h2 className="text-[11px] font-black text-white uppercase tracking-widest leading-none">KINERJA PETUGAS</h2>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-[8px] font-black text-slate-500 uppercase">Peringkat</span>
           <TrendingUp size={12} className="text-orange-500" />
        </div>
      </div>
      
      <div className="p-3 flex flex-col overflow-hidden bg-white">
        <div className="w-full h-full border-2 border-slate-200 rounded-xl overflow-hidden flex flex-col bg-white shadow-sm">
          {/* Table Header */}
          <div className={`grid grid-cols-12 bg-slate-50 border-b-2 border-slate-200 text-[8px] font-black text-slate-500 uppercase tracking-[0.05em] py-2.5 px-3 shrink-0`}>
            {isInvoiceMode ? (
              <>
                <div className="col-span-4">PETUGAS</div>
                <div className="col-span-1 text-center">WO</div>
                <div className="col-span-1.5 text-center text-indigo-600">MANDIRI</div>
                <div className="col-span-1.5 text-center text-blue-600">OFFLINE</div>
                <div className="col-span-2 text-center text-amber-600">JANJI</div>
                <div className="col-span-2 text-center text-emerald-600 font-extrabold">REALISASI</div>
              </>
            ) : (
              <>
                <div className="col-span-6">NAMA PETUGAS</div>
                <div className="col-span-2 text-center">TOTAL</div>
                <div className="col-span-2 text-center text-emerald-600">VALID</div>
                <div className="col-span-2 text-center text-rose-600">T.VALID</div>
              </>
            )}
          </div>
          
          <div className="overflow-y-auto scrollbar-thin max-h-[500px]">
            {sortedPetugas.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-[10px] italic uppercase font-black tracking-widest opacity-50">
                Menunggu Catatan Kinerja
              </div>
            ) : (
              sortedPetugas.map((name, idx) => {
                const metrics = summaryMap[name];
                const realisasi = metrics.lunasMandiri + metrics.lunasOffline + metrics.janjiBayar;
                return (
                  <div 
                    key={name} 
                    className={`
                      grid grid-cols-12 items-center px-3 py-3.5 text-[10px] font-black border-b border-slate-100 
                      hover:bg-indigo-50/50 transition-colors cursor-default
                      ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}
                    `}
                  >
                    {isInvoiceMode ? (
                      <>
                        <div className="col-span-4 text-slate-900 pr-1 uppercase tracking-tighter flex items-center gap-1.5 overflow-hidden">
                          <span className={`text-[8px] font-mono w-4 h-4 flex items-center justify-center rounded bg-slate-100 text-slate-500 shrink-0`}>
                            {idx + 1}
                          </span>
                          <span className="whitespace-normal break-words leading-tight">{name}</span>
                        </div>
                        <div className="col-span-1 text-center font-mono text-slate-500">{metrics.totalWo}</div>
                        <div className="col-span-1.5 text-center text-indigo-700 font-mono">{metrics.lunasMandiri}</div>
                        <div className="col-span-1.5 text-center text-blue-700 font-mono">{metrics.lunasOffline}</div>
                        <div className="col-span-2 text-center text-amber-700 font-mono">{metrics.janjiBayar}</div>
                        <div className="col-span-2 text-center text-emerald-700 font-mono bg-emerald-50 py-1 rounded-md">{realisasi}</div>
                      </>
                    ) : (
                      <>
                        <div className="col-span-6 text-slate-900 pr-2 uppercase tracking-tight flex items-center gap-2 overflow-hidden">
                          <span className={`
                            text-[9px] font-mono w-5 h-5 flex items-center justify-center rounded-md shrink-0
                            ${idx < 3 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}
                          `}>
                            {(idx + 1).toString().padStart(2, '0')}
                          </span>
                          <span className="whitespace-normal break-words leading-tight">{name}</span>
                        </div>
                        <div className="col-span-2 text-center text-indigo-700 font-mono text-[10px] bg-indigo-50/50 py-1 rounded-md">{metrics.total}</div>
                        <div className="col-span-2 text-center text-emerald-700 font-mono text-[10px]">{metrics.valid}</div>
                        <div className="col-span-2 text-center text-rose-700 font-mono text-[10px]">{metrics.invalid}</div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PetugasSummaryPanel);
