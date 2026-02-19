
import React, { useMemo } from 'react';
import { LPBData, WOKontrakData } from '../types';
import { User, MapPin, Hash, Zap, ShieldCheck, Activity, BarChart2, CheckCircle2, AlertCircle, Clock, Info, FileText, Smartphone, CreditCard, CalendarClock, Target, ListChecks, TrendingUp } from 'lucide-react';

interface InfoPanelProps {
  data: LPBData | null;
  allData?: LPBData[];
  woKontrakList?: WOKontrakData[];
  isInvoiceMode?: boolean;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ data, allData = [], woKontrakList = [], isInvoiceMode = false }) => {
  const summary = useMemo(() => {
    if (!allData.length && !woKontrakList.length) return { total: 0, valid: 0, invalid: 0, woKontrak: 0, wo: 0, real: 0, mandiri: 0, offline: 0, janji: 0 };
    
    // Calculate values from Invoice Data (Filtered by Unit/BLTH/Petugas as per allData)
    const stats = allData.reduce((acc, item) => {
      if (isInvoiceMode) {
        acc.wo += (item.TOTALLEMBAR || 0);
        const m = item.LUNAS_MANDIRI || 0;
        const o = item.LUNAS_OFFLINE || 0;
        const j = item.JANJI_BAYAR || 0;
        acc.mandiri += m;
        acc.offline += o;
        acc.janji += j;
        acc.real += (m + o + j);
      } else {
        acc.total++;
        if (item.VALIDASI === 'VALID') acc.valid++;
        else if (item.VALIDASI === 'TIDAK VALID') acc.invalid++;
      }
      return acc;
    }, { total: 0, valid: 0, invalid: 0, woKontrak: 0, wo: 0, real: 0, mandiri: 0, offline: 0, janji: 0 });

    // Calculate WO Kontrak from the separate list (Filtered by Unit in App.tsx)
    stats.woKontrak = woKontrakList.reduce((acc, item) => acc + (Number(item.wo_invoice) || 0), 0);

    return stats;
  }, [allData, woKontrakList, isInvoiceMode]);

  if (!data) {
    return (
      <div className="bg-white border border-slate-200 rounded-[40px] h-full flex flex-col shadow-sm overflow-hidden fade-in">
        <div className="p-6 pb-2 shrink-0">
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-slate-950 text-white rounded-xl shadow-lg"><Activity size={20} /></div>
              <div>
                <h2 className="text-[14px] font-black text-slate-900 uppercase tracking-tight italic leading-none">ULP BUKITTINGGI</h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  RINGKASAN EKSEKUTIF
                </p>
              </div>
           </div>
        </div>

        <div className="px-6 flex-1 flex flex-col justify-center gap-2 pb-6 overflow-hidden">
          {isInvoiceMode ? (
            <div className="space-y-2">
              {/* Main 3 Metrics as requested */}
              {[
                { label: 'TOTAL WO KONTRAK', value: summary.woKontrak, icon: Target, color: 'indigo', bg: 'bg-indigo-50', percentage: summary.woKontrak > 0 ? (summary.real / summary.woKontrak) * 100 : 0 },
                { label: 'TOTAL WO', value: summary.wo, icon: ListChecks, color: 'blue', bg: 'bg-blue-50', percentage: summary.wo > 0 ? (summary.real / summary.wo) * 100 : 0 },
                { label: 'TOTAL REALISASI', value: summary.real, icon: TrendingUp, color: 'emerald', bg: 'bg-emerald-50' }
              ].map((stat) => (
                <div key={stat.label} className={`p-5 rounded-[24px] ${stat.bg} border border-white flex items-center justify-between group hover:shadow-lg transition-all duration-300`}>
                  <div className="flex flex-col">
                    <p className={`text-[10px] font-black text-${stat.color}-900/40 uppercase tracking-widest leading-none mb-1`}>{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                      <p className={`text-3xl font-black text-${stat.color}-700 tracking-tighter leading-none`}>{stat.value.toLocaleString()}</p>
                      {stat.percentage !== undefined && (
                        <span className={`text-[11px] font-black text-${stat.color}-600 bg-white/80 px-2 py-0.5 rounded-lg border border-${stat.color}-100 shadow-sm`}>
                          {stat.percentage.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl bg-white shadow-sm text-${stat.color}-500 group-hover:scale-110 transition-transform`}>
                    <stat.icon size={24} />
                  </div>
                </div>
              ))}

              {/* Secondary Breakdown */}
              <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-100">
                {[
                  { label: 'MANDIRI', value: summary.mandiri, color: 'indigo' },
                  { label: 'OFFLINE', value: summary.offline, color: 'blue' },
                  { label: 'JANJI', value: summary.janji, color: 'amber' }
                ].map(sub => (
                  <div key={sub.label} className="text-center p-2 bg-slate-50 rounded-xl">
                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">{sub.label}</p>
                    <p className={`text-sm font-black text-${sub.color}-600`}>{sub.value.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'TOTAL BACA', value: summary.total, icon: BarChart2, color: 'indigo' },
                { label: 'TOTAL VALID', value: summary.valid, icon: CheckCircle2, color: 'emerald' },
                { label: 'TIDAK VALID', value: summary.invalid, icon: AlertCircle, color: 'rose' }
              ].map((stat) => (
                <div key={stat.label} className="p-6 rounded-[24px] bg-slate-50 border border-slate-200 flex items-center justify-between group hover:bg-white hover:shadow-lg transition-all duration-300">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className={`text-3xl font-black text-${stat.color}-700 tracking-tighter leading-none`}>{stat.value.toLocaleString()}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-500 transition-all`}>
                    <stat.icon size={24} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-950 text-center shrink-0">
          <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] italic">UNIT LAYANAN PELANGGAN • BUKITTINGGI</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-[40px] h-full flex flex-col shadow-sm overflow-hidden fade-in">
      <div className="bg-slate-950 p-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-indigo-500 rounded-xl text-white shadow-2xl shadow-indigo-500/30"><User size={20} /></div>
          <div>
            <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Detail Visual</h2>
            <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5 tracking-widest">Metadata Pelanggan</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`status-badge text-[9px] font-black py-1 px-3 ${data.VALIDASI === 'VALID' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
            {data.VALIDASI}
          </span>
          {data.KETERANGAN && (
            <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-lg border border-white/5 max-w-[150px]">
              <FileText size={10} className="text-indigo-400 shrink-0" />
              <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest truncate">
                {data.KETERANGAN}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 p-6 space-y-4 overflow-auto scrollbar-thin">
        <div className="p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl shadow-inner">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Entitas Nama</p>
           <p className="text-lg font-extrabold text-slate-900 uppercase leading-none tracking-tight">{data.NAMA}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Hash, label: 'IDPEL', value: data.IDPEL, sub: 'UNIK' },
            { icon: Zap, label: 'TARIF / DAYA', value: `${data.TARIF}/${data.DAYA} VA`, sub: 'KAPASITAS' },
            { icon: Info, label: 'Wilayah', value: data.UNIT, sub: 'UNIT' },
            { icon: Clock, label: 'Siklus', value: data.BLTH, sub: 'PERIODE' }
          ].map(item => (
            <div key={item.label} className="p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-500/30 transition-all group">
               <div className="flex items-center justify-between mb-1.5">
                 <item.icon size={14} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                 <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{item.sub}</span>
               </div>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</p>
               <p className="text-xs font-black text-slate-900 truncate uppercase">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="p-5 bg-slate-900 rounded-[24px] shadow-2xl border border-white/5 group">
           <div className="flex items-center gap-2 mb-2">
             <MapPin size={14} className="text-indigo-400" />
             <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-black">Lokasi Terdaftar</p>
           </div>
           <p className="text-xs text-white leading-relaxed font-bold uppercase italic opacity-80 group-hover:opacity-100 transition-opacity">
             {data.ALAMAT || "Alamat tidak tersedia dalam sistem."}
           </p>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[9px] font-black text-slate-800 uppercase shadow-sm">PLN</div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Petugas</span>
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{data.PETUGAS}</span>
          </div>
        </div>
        <div className="text-right">
           <span className="block text-[9px] font-black text-indigo-600 tracking-[0.1em] uppercase">VERIFIED</span>
           <span className="text-[8px] font-bold text-slate-400 uppercase">ENGINE v7.5</span>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;
