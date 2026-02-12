
import React from 'react';
import { LPBData } from '../types';
import { ClipboardList, BarChart3 } from 'lucide-react';

interface SummaryPanelProps {
  data: LPBData[];
}

interface SummaryEntry {
  total: number;
  valid: number;
  invalid: number;
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({ data }) => {
  const summaryMap = data.reduce((acc: Record<string, SummaryEntry>, item) => {
    const unit = item.UNIT || 'UNKNOWN';
    if (!acc[unit]) {
      acc[unit] = { total: 0, valid: 0, invalid: 0 };
    }
    acc[unit].total++;
    if (item.VALIDASI === 'VALID') {
      acc[unit].valid++;
    } else if (item.VALIDASI === 'TIDAK VALID') {
      acc[unit].invalid++;
    }
    return acc;
  }, {} as Record<string, SummaryEntry>);

  const units = Object.keys(summaryMap).sort();

  return (
    <div className="bg-white border-2 border-slate-300 rounded-2xl flex flex-col overflow-hidden h-full shadow-lg">
      <div className="p-3 bg-slate-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-600 rounded-lg text-white shadow-md shadow-orange-900/20">
             <ClipboardList size={16} />
          </div>
          <h2 className="text-[11px] font-black text-white uppercase tracking-widest leading-none">REKAP ULP</h2>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[8px] font-black text-slate-500 uppercase">7 Strategic Units</span>
           <BarChart3 size={12} className="text-orange-500" />
        </div>
      </div>
      
      <div className="flex-1 p-3 flex flex-col overflow-hidden bg-slate-50">
        <div className="w-full h-full border-2 border-slate-200 rounded-xl overflow-hidden flex flex-col bg-white shadow-sm">
          {/* Table Header */}
          <div className="grid grid-cols-12 bg-slate-100 border-b-2 border-slate-200 text-[8px] font-black text-slate-500 uppercase tracking-[0.15em] py-2.5 px-4 shrink-0">
            <div className="col-span-6">ULP</div>
            <div className="col-span-2 text-center">TOTAL</div>
            <div className="col-span-2 text-center text-emerald-600">VAL</div>
            <div className="col-span-2 text-center text-rose-600">INV</div>
          </div>
          
          {/* Table Body - Optimized for 7 Rows */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {units.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400 text-[10px] italic font-black uppercase tracking-widest">
                System Syncing...
              </div>
            ) : (
              units.map((unit, idx) => (
                <div 
                  key={unit} 
                  className={`
                    grid grid-cols-12 items-center px-4 py-3.5 text-[11px] font-black border-b border-slate-100 
                    hover:bg-orange-50/50 transition-colors cursor-default
                    ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}
                  `}
                >
                  <div className="col-span-6 text-slate-900 truncate uppercase tracking-tight pr-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300 mr-2"></span>
                    {unit}
                  </div>
                  <div className="col-span-2 text-center text-indigo-700 font-mono text-[10px] bg-indigo-50/50 py-1 rounded-md">{summaryMap[unit].total}</div>
                  <div className="col-span-2 text-center text-emerald-700 font-mono text-[10px]">{summaryMap[unit].valid}</div>
                  <div className="col-span-2 text-center text-rose-700 font-mono text-[10px]">{summaryMap[unit].invalid}</div>
                </div>
              ))
            )}
          </div>

          {/* Table Footer */}
          <div className="grid grid-cols-12 bg-slate-900 text-[10px] font-black text-white uppercase py-3 px-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <div className="col-span-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
              AGGREGATE TOTAL
            </div>
            <div className="col-span-2 text-center text-orange-400 font-mono text-xs">
              {Object.values(summaryMap).reduce((a: number, b: SummaryEntry) => a + b.total, 0)}
            </div>
            <div className="col-span-2 text-center text-emerald-400 font-mono text-xs">
              {Object.values(summaryMap).reduce((a: number, b: SummaryEntry) => a + b.valid, 0)}
            </div>
            <div className="col-span-2 text-center text-rose-400 font-mono text-xs">
              {Object.values(summaryMap).reduce((a: number, b: SummaryEntry) => a + b.invalid, 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryPanel;
