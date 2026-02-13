
import React, { useMemo } from 'react';
import { LPBData } from '../types';
import { User, MapPin, Hash, Zap, ShieldCheck, Activity, BarChart2, CheckCircle2, AlertCircle, Clock, Info } from 'lucide-react';

interface InfoPanelProps {
  data: LPBData | null;
  allData?: LPBData[];
}

const InfoPanel: React.FC<InfoPanelProps> = ({ data, allData = [] }) => {
  const summary = useMemo(() => {
    if (!allData.length) return { total: 0, valid: 0, invalid: 0 };
    return allData.reduce((acc, item) => {
      acc.total++;
      if (item.VALIDASI === 'VALID') acc.valid++;
      else if (item.VALIDASI === 'TIDAK VALID') acc.invalid++;
      return acc;
    }, { total: 0, valid: 0, invalid: 0 });
  }, [allData]);

  if (!data) {
    return (
      <div className="bg-white border border-slate-200 rounded-[40px] h-full flex flex-col shadow-sm overflow-hidden fade-in">
        <div className="p-8 pb-4">
           <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Activity size={24} /></div>
              <h2 className="text-base font-black text-slate-900 uppercase tracking-tight italic">ULP BUKITTINGGI</h2>
           </div>
        </div>

        <div className="px-8 flex-1 space-y-4 overflow-auto scrollbar-thin">
          {[
            { label: 'TOTAL BACA', value: summary.total, icon: BarChart2, color: 'indigo' },
            { label: 'TOTAL VALID', value: summary.valid, icon: CheckCircle2, color: 'emerald' },
            { label: 'TIDAK VALID', value: summary.invalid, icon: AlertCircle, color: 'rose' }
          ].map((stat) => (
            <div key={stat.label} className="p-7 rounded-[28px] bg-slate-50 border border-slate-200 flex items-center justify-between group hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                <p className={`text-4xl font-black text-${stat.color}-700 tracking-tighter`}>{stat.value.toLocaleString()}</p>
              </div>
              <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-500 group-hover:bg-${stat.color}-600 group-hover:text-white transition-all`}>
                <stat.icon size={32} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-[40px] h-full flex flex-col shadow-sm overflow-hidden fade-in">
      <div className="bg-slate-950 p-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-5">
          <div className="p-3 bg-indigo-500 rounded-2xl text-white shadow-2xl shadow-indigo-500/30"><User size={24} /></div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">Visualisasi Detail</h2>
            <p className="text-[11px] font-bold text-slate-500 uppercase mt-1 tracking-widest">Metadata Pelanggan</p>
          </div>
        </div>
        <span className={`status-badge text-[11px] font-black py-1.5 px-4 ${data.VALIDASI === 'VALID' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
          {data.VALIDASI}
        </span>
      </div>

      <div className="flex-1 p-8 space-y-5 overflow-auto scrollbar-thin">
        <div className="p-7 bg-slate-50 border-2 border-slate-100 rounded-3xl shadow-inner">
           <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Entitas Nama</p>
           <p className="text-2xl font-extrabold text-slate-900 uppercase leading-none tracking-tight">{data.NAMA}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Hash, label: 'IDPEL', value: data.IDPEL, sub: 'UNIK' },
            { icon: Zap, label: 'TARIF / DAYA', value: `${data.TARIF}/${data.DAYA} VA`, sub: 'KAPASITAS' },
            { icon: Info, label: 'Wilayah', value: data.UNIT, sub: 'UNIT' },
            { icon: Clock, label: 'Siklus', value: data.BLTH, sub: 'PERIODE' }
          ].map(item => (
            <div key={item.label} className="p-5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-500/30 hover:shadow-lg transition-all group">
               <div className="flex items-center justify-between mb-2">
                 <item.icon size={16} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                 <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{item.sub}</span>
               </div>
               <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
               <p className="text-sm font-black text-slate-900 truncate uppercase">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="p-7 bg-slate-900 rounded-[32px] shadow-2xl border border-white/5 group">
           <div className="flex items-center gap-3 mb-3">
             <MapPin size={16} className="text-indigo-400" />
             <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-black">Lokasi Terdaftar</p>
           </div>
           <p className="text-sm text-white leading-relaxed font-bold uppercase italic opacity-80 group-hover:opacity-100 transition-opacity">
             {data.ALAMAT || "Alamat tidak tersedia dalam sistem."}
           </p>
        </div>
      </div>
      
      <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-800 uppercase shadow-sm">PLN</div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Penanggung Jawab</span>
            <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{data.PETUGAS}</span>
          </div>
        </div>
        <div className="text-right">
           <span className="block text-[10px] font-black text-indigo-600 tracking-[0.2em] uppercase">VERIFIED</span>
           <span className="text-[9px] font-bold text-slate-400 uppercase">LPB ENGINE 7.5.HD</span>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;
