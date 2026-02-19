
import React from 'react';
import { LPBData } from '../types';
import { ClipboardList, BarChart3 } from 'lucide-react';

interface SummaryPanelProps {
  data: LPBData[];
  isInvoiceMode?: boolean;
}

interface SummaryEntry {
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

const SummaryPanel: React.FC<SummaryPanelProps> = ({ data, isInvoiceMode = false }) => {
  const summaryMap = data.reduce((acc: Record<string, SummaryEntry>, item) => {
    const unit = item.UNIT || 'TIDAK DIKETAHUI';
    if (!acc[unit]) {
      acc[unit] = { 
        total: 0, valid: 0, invalid: 0,
        totalWo: 0, lunasMandiri: 0, lunasOffline: 0, janjiBayar: 0 
      };
    }
    
    if (isInvoiceMode) {
      acc[unit].totalWo += (item.TOTALLEMBAR || 0);
      acc[unit].lunasMandiri += (item.LUNAS_MANDIRI || 0);
      acc[unit].lunasOffline += (item.LUNAS_OFFLINE || 0);
      acc[unit].janjiBayar += (item.JANJI_BAYAR || 0);
    } else {
      acc[unit].total++;
      if (item.VALIDASI === 'VALID') acc[unit].valid++;
      else if (item.VALIDASI === 'TIDAK VALID') acc[unit].invalid++;
    }
    
    return acc;
  }, {} as Record<string, SummaryEntry>);

  const units = Object.keys(summaryMap).sort();

  return (
    <div className="bg-white border-2 border-slate-300 rounded-2xl flex flex-col overflow-hidden shadow-lg h-fit">
      <div className="p-3 bg-slate-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-600 rounded-lg text-white shadow-md shadow-orange-900/20">
             <ClipboardList size={16} />
          </div>
          <h2 className="text-[11px] font-black text-white uppercase tracking-widest leading-none">REKAPITULASI UNIT</h2>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[8px] font-black text-slate-500 uppercase">{units.length} Unit</span>
           <BarChart3 size={12} className="text-orange-500" />
        </div>
      </div>
      
      <div className="flex flex-col bg-white">
        {/* Table Header */}
        <div className={`grid grid-cols-12 bg-slate-100 border-b-2 border-slate-200 text-[7.5px] font-black text-slate-500 uppercase tracking-tighter py-3 px-3 shrink-0`}>
          {isInvoiceMode ? (
            <>
              <div className="col-span-3">UNIT</div>
              <div className="col-span-1.5 text-center">WO</div>
              <div className="col-span-2 text-center text-emerald-600 font-extrabold">REALISASI</div>
              <div className="col-span-2 text-center text-indigo-600">MANDIRI</div>
              <div className="col-span-2 text-center text-blue-600">OFFLINE</div>
              <div className="col-span-1.5 text-center text-amber-600">JANJI</div>
            </>
          ) : (
            <>
              <div className="col-span-6">KANTOR UNIT</div>
              <div className="col-span-2 text-center">TOTAL</div>
              <div className="col-span-2 text-center text-emerald-600">VAL</div>
              <div className="col-span-2 text-center text-rose-600">INV</div>
            </>
          )}
        </div>
        
        {/* Table Body - Container handles scroll, height set to fit content up to 450px */}
        <div className="overflow-y-auto scrollbar-thin bg-slate-50/30 max-h-[380px]">
          <div>
            {units.length === 0 ? (
              <div className="flex items-center justify-center min-h-[100px] text-slate-400 text-[10px] italic font-black uppercase tracking-widest text-center px-4">
                Menyinkronkan Sistem...
              </div>
            ) : (
              units.map((unit, idx) => {
                const entry = summaryMap[unit];
                const realisasi = entry.lunasMandiri + entry.lunasOffline + entry.janjiBayar;
                return (
                  <div 
                    key={unit} 
                    className={`
                      grid grid-cols-12 items-center px-3 py-3 text-[10px] font-black border-b border-slate-100 
                      hover:bg-orange-50 transition-colors cursor-default
                      ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}
                    `}
                  >
                    {isInvoiceMode ? (
                      <>
                        <div className="col-span-3 text-slate-900 truncate uppercase tracking-tighter">{unit}</div>
                        <div className="col-span-1.5 text-center font-mono text-slate-500">{entry.totalWo}</div>
                        <div className="col-span-2 text-center text-emerald-700 font-mono bg-emerald-50 py-1 rounded-md">{realisasi}</div>
                        <div className="col-span-2 text-center text-indigo-700 font-mono">{entry.lunasMandiri}</div>
                        <div className="col-span-2 text-center text-blue-700 font-mono">{entry.lunasOffline}</div>
                        <div className="col-span-1.5 text-center text-amber-700 font-mono">{entry.janjiBayar}</div>
                      </>
                    ) : (
                      <>
                        <div className="col-span-6 text-slate-900 truncate uppercase tracking-tight pr-2">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300 mr-2"></span>
                          {unit}
                        </div>
                        <div className="col-span-2 text-center text-indigo-700 font-mono text-[10px] bg-indigo-50/50 py-1 rounded-md">{entry.total}</div>
                        <div className="col-span-2 text-center text-emerald-700 font-mono text-[10px]">{entry.valid}</div>
                        <div className="col-span-2 text-center text-rose-700 font-mono text-[10px]">{entry.invalid}</div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Table Footer - Follows immediately after the list */}
        <div className="grid grid-cols-12 bg-slate-900 text-[9px] font-black text-white uppercase py-4 px-3 shrink-0 border-t border-white/10">
          {isInvoiceMode ? (
            <>
              <div className="col-span-3">TOTAL</div>
              <div className="col-span-1.5 text-center text-slate-400 font-mono">
                {/* Fixed TS error by adding explicit types to reduce parameters */}
                {Object.values(summaryMap).reduce((a: number, b: SummaryEntry) => a + b.totalWo, 0)}
              </div>
              <div className="col-span-2 text-center text-emerald-400 font-mono">
                {/* Fixed TS error by adding explicit types to reduce parameters */}
                {Object.values(summaryMap).reduce((a: number, b: SummaryEntry) => a + (b.lunasMandiri + b.lunasOffline + b.janjiBayar), 0)}
              </div>
              <div className="col-span-2 text-center text-indigo-400 font-mono">
                {/* Fixed TS error by adding explicit types to reduce parameters */}
                {Object.values(summaryMap).reduce((a: number, b: SummaryEntry) => a + b.lunasMandiri, 0)}
              </div>
              <div className="col-span-2 text-center text-blue-400 font-mono">
                {/* Fixed TS error by adding explicit types to reduce parameters */}
                {Object.values(summaryMap).reduce((a: number, b: SummaryEntry) => a + b.lunasOffline, 0)}
              </div>
              <div className="col-span-1.5 text-center text-amber-400 font-mono">
                {/* Fixed TS error by adding explicit types to reduce parameters */}
                {Object.values(summaryMap).reduce((a: number, b: SummaryEntry) => a + b.janjiBayar, 0)}
              </div>
            </>
          ) : (
            <>
              <div className="col-span-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                TOTAL AGREGAT
              </div>
              <div className="col-span-2 text-center text-orange-400 font-mono text-xs">
                {/* Fixed TS error by adding explicit types to reduce parameters */}
                {Object.values(summaryMap).reduce((a: number, b: SummaryEntry) => a + b.total, 0)}
              </div>
              <div className="col-span-2 text-center text-emerald-400 font-mono text-xs">
                {/* Fixed TS error by adding explicit types to reduce parameters */}
                {Object.values(summaryMap).reduce((a: number, b: SummaryEntry) => a + b.valid, 0)}
              </div>
              <div className="col-span-2 text-center text-rose-400 font-mono text-xs">
                {/* Fixed TS error by adding explicit types to reduce parameters */}
                {Object.values(summaryMap).reduce((a: number, b: SummaryEntry) => a + b.invalid, 0)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryPanel;
