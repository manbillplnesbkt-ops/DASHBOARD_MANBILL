import React, { useMemo } from 'react';
import { LPBData } from '../types';
import { User, MapPin, Hash, Zap, ShieldCheck, Activity, BarChart2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface InfoPanelProps {
  data: LPBData | null;
  allData?: LPBData[];
}

const InfoPanel: React.FC<InfoPanelProps> = ({ data, allData = [] }) => {
  const up3Summary = useMemo(() => {
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
      <div className="bg-white border-2 border-slate-300 rounded-2xl h-full flex flex-col shadow-lg overflow-hidden">
        <div className="bg-slate-900 p-5 flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg">
            <Activity size={24} />
          </div>
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-widest leading-tight">INFORMASI UP3 BUKITTINGGI</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Statistical Monitoring Hub</p>
          </div>
        </div>

        <div className="p-6 grid grid-cols-3 gap-6 flex-1 bg-white">
          <div className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-100 flex flex-col items-center justify-center group hover:border-indigo-200 hover:shadow-xl transition-all duration-300">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">TOTAL BACA</p>
            <p className="text-4xl font-black text-slate-900 group-hover:text-indigo-700 transition-colors">{up3Summary.total.toLocaleString()}</p>
            <BarChart2 size={18} className="mt-3 text-slate-300 group-hover:text-indigo-400" />
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-100 flex flex-col items-center justify-center group hover:border-emerald-200 hover:shadow-xl transition-all duration-300">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">TOTAL VALID</p>
            <p className="text-4xl font-black text-emerald-700">{up3Summary.valid.toLocaleString()}</p>
            <CheckCircle2 size={18} className="mt-3 text-emerald-300 group-hover:text-emerald-500" />
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-100 flex flex-col items-center justify-center group hover:border-rose-200 hover:shadow-xl transition-all duration-300">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">TIDAK VALID</p>
            <p className="text-4xl font-black text-rose-700">{up3Summary.invalid.toLocaleString()}</p>
            <AlertCircle size={18} className="mt-3 text-rose-300 group-hover:text-rose-500" />
          </div>
        </div>
      </div>
    );
  }

  const InfoItem = ({ icon: Icon, label, value, color = "text-indigo-700", bgColor = "bg-indigo-50" }: any) => (
    <div className="flex items-start gap-4 p-3 bg-white rounded-xl border-2 border-slate-50 hover:border-slate-300 transition-all duration-200 group">
      <div className={`p-2.5 ${bgColor} rounded-xl ${color} shadow-sm group-hover:scale-110 transition-transform`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">{label}</p>
        <p className="text-[12px] font-black text-slate-900 truncate leading-tight uppercase">{value || '-'}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white border-2 border-slate-300 rounded-2xl h-full flex flex-col shadow-lg overflow-hidden max-h-[300px]">
      <div className="bg-slate-900 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-600 rounded-xl text-white shadow-lg">
            <User size={20} />
          </div>
          <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none">
            DETAIL PELANGGAN
          </h2>
        </div>
        <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${data.VALIDASI === 'VALID' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
          {data.VALIDASI}
        </span>
      </div>

      <div className="p-4 grid grid-cols-3 gap-3 flex-none bg-white">
        <InfoItem icon={Hash} label="IDPEL" value={data.IDPEL} />
        <InfoItem icon={User} label="NAMA" value={data.NAMA} color="text-slate-800" bgColor="bg-slate-100" />
        <InfoItem icon={Zap} label="UNIT" value={data.UNIT} color="text-orange-600" bgColor="bg-orange-50" />
        <InfoItem icon={MapPin} label="RBM" value={data["KODE RBM"]} color="text-purple-700" bgColor="bg-purple-50" />
        <InfoItem icon={Hash} label="NO METER" value={data["NO METER"]} color="text-amber-700" bgColor="bg-amber-50" />
        <InfoItem icon={ShieldCheck} label="TARIF/DAYA" value={`${data.TARIF} / ${data.DAYA}`} color="text-cyan-700" bgColor="bg-cyan-50" />
      </div>

      <div className="mx-4 mb-4 p-4 bg-slate-900 rounded-xl border-2 border-slate-800 flex-1 overflow-y-auto shadow-inner">
        <div className="flex items-center gap-2 mb-2">
           <MapPin size={14} className="text-orange-500" />
           <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">ALAMAT LENGKAP</p>
        </div>
        <p className="text-[13px] text-white leading-relaxed font-black uppercase tracking-tight">
          {data.ALAMAT || "ALAMAT TIDAK TERSEDIA"}
        </p>
      </div>
      
      <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">
        <span className="flex items-center gap-2"><Clock size={12} className="text-indigo-600" /> BLTH: {data.BLTH}</span>
        <span className="flex items-center gap-2"><User size={12} className="text-orange-600" /> PETUGAS: {data.PETUGAS}</span>
      </div>
    </div>
  );
};

export default InfoPanel;