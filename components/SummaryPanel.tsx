import React from 'react';
import { LPBData } from '../types';
import { ClipboardList, BarChart3 } from 'lucide-react';

interface SummaryPanelProps {
  data: LPBData[];
}

// Define interface for summary map entries to fix type inference issues
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
      <div className="p-4 bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-600 rounded-xl text-white shadow-md">
             <ClipboardList size={20} />
          </div>
          <h2 className="text-sm font-black text-white uppercase tracking-widest">REKAP UNIT</h2>
        </div>
        <span className="text-[10px] font-black text-slate-900 bg-white px-3 py-1 rounded-full shadow-sm">
          {units.length} UNITS
        </span>
      </div>
      
      <div className="flex-1 p-4 flex flex-col overflow-hidden bg-white">
        {units.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-[11px] font-black italic">
            NO DATA AVAILABLE
          </div>
        ) : (
          <div className="w-full h-full border-2 border-slate-200 rounded-xl overflow-hidden flex flex-col bg-white">
            <div className="grid grid-cols-12 bg-slate-900 border-b border-slate-800 text-[9px] font-black text-slate-400 uppercase tracking-widest py-3 px-4">
              <div className="col-span-4">UNIT</div>
              <div className="col-span-2 text-center">TOTAL</div>
              <div className="col-span-3 text-center">VALID</div>
              <div className="col-span-3 text-center">INVALID</div>
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {units.map((unit, idx) => (
                <div 
                  key={unit} 
                  className={`grid grid-cols-12 items-center px-4 py-3 text-[11px] font-black border-b border-slate-100 hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                >
                  <div className="col-span-4 text-slate-900 truncate uppercase tracking-tight">{unit}</div>
                  <div className="col-span-2 text-center text-indigo-700 font-mono text-xs">
                    {summaryMap[unit].total}
                  </div>
                  <div className="col-span-3 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700 text-[10px] border border-emerald-200">
                      {summaryMap[unit].valid}
                    </span>
                  </div>
                  <div className="col-span-3 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-lg bg-rose-100 text-rose-700 text-[10px] border border-rose-200">
                      {summaryMap[unit].invalid}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-12 bg-slate-900 border-t border-slate-800 text-[11px] font-black text-white uppercase py-3 px-4">
              <div className="col-span-4 tracking-widest italic">GRAND TOTAL</div>
              <div className="col-span-2 text-center text-orange-400">
                {/* Fixed: adding explicit types to solve 'unknown' type error in reduce callback */}
                {Object.values(summaryMap).reduce((a: number, b: SummaryEntry) => a + b.total, 0)}
              </div>
              <div className="col-span-3 text-center text-emerald-400">
                {/* Fixed: adding explicit types to solve 'unknown' type error in reduce callback */}
                {Object.values(summaryMap).reduce((a: number, b: SummaryEntry) => a + b.valid, 0)}
              </div>
              <div className="col-span-3 text-center text-rose-400">
                {/* Fixed: adding explicit types to solve 'unknown' type error in reduce callback */}
                {Object.values(summaryMap).reduce((a: number, b: SummaryEntry) => a + b.invalid, 0)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryPanel;