
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
      <div className="bg-white border-2 border-slate-300 rounded-2xl h-full flex flex-col shadow-md overflow-hidden">
        <div className="bg-slate-900 p-3 flex items-center gap-3 shrink-0">
          <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-md">
            <Activity size={18} />
          </div>
          <div>
            <h2 className="text-xs font-black text-white uppercase tracking-widest leading-tight">STATS OVERVIEW</h2>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">UP3 BUKITTINGGI</p>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 gap-3 flex-1 bg-white overflow-auto scrollbar-thin">
          <div className="bg-slate-50 rounded-xl p-3 border-2 border-slate-100 flex items-center justify-between group hover:border-indigo-200 transition-all">
            <div>
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">TOTAL RECORDS</p>
               <p className="text-xl font-black text-slate-900 group-hover:text-indigo-700">{up3Summary.total.toLocaleString()}</p>
            </div>
            <BarChart2 size={24} className="text-slate-200 group-hover:text-indigo-400 transition-colors" />
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border-2 border-slate-100 flex items-center justify-between group hover:border-emerald-200 transition-all">
            <div>
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 text-emerald-600">VALID DATA</p>
               <p className="text-xl font-black text-emerald-700">{up3Summary.valid.toLocaleString()}</p>
            </div>
            <CheckCircle2 size={24} className="text-emerald-100 group-hover:text-emerald-400 transition-colors" />
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border-2 border-slate-100 flex items-center justify-between group hover:border-rose-200 transition-all">
            <div>
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 text-rose-600">INVALID DATA</p>
               <p className="text-xl font-black text-rose-700">{up3Summary.invalid.toLocaleString()}</p>
            </div>
            <AlertCircle size={24} className="text-rose-100 group-hover:text-rose-400 transition-colors" />
          </div>
        </div>
      </div>
    );
  }

  const InfoItem = ({ icon: Icon, label, value, color = "text-indigo-700", bgColor = "bg-indigo-50" }: any) => (
    <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-100 hover:border-slate-200 transition-all group shrink-0">
      <div className={`p-1.5 ${bgColor} rounded-md ${color} shrink-0`}>
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <p className="text-[8px] uppercase tracking-widest text-slate-400 font-black mb-0.5">{label}</p>
        <p className="text-[10px] font-black text-slate-900 truncate leading-tight uppercase">{value || '-'}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white border-2 border-slate-300 rounded-2xl h-full flex flex-col shadow-md overflow-hidden">
      <div className="bg-slate-900 p-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-orange-600 rounded-lg text-white">
            <User size={16} />
          </div>
          <h2 className="text-[10px] font-black text-white uppercase tracking-widest">PELANGGAN</h2>
        </div>
        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${data.VALIDASI === 'VALID' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
          {data.VALIDASI}
        </span>
      </div>

      <div className="flex-1 p-3 flex flex-col gap-2 overflow-auto scrollbar-thin bg-white">
        <div className="grid grid-cols-2 gap-2">
           <InfoItem icon={Hash} label="IDPEL" value={data.IDPEL} />
           <InfoItem icon={Hash} label="METER" value={data["NO METER"]} />
           <InfoItem icon={Zap} label="UNIT" value={data.UNIT} color="text-orange-600" bgColor="bg-orange-50" />
           <InfoItem icon={ShieldCheck} label="DAYA" value={`${data.TARIF}/${data.DAYA}`} color="text-cyan-700" bgColor="bg-cyan-50" />
        </div>
        
        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">NAMA PELANGGAN</p>
           <p className="text-xs font-black text-slate-900 uppercase truncate">{data.NAMA}</p>
        </div>

        <div className="p-2 bg-slate-900 rounded-lg flex-1 min-h-[60px]">
           <div className="flex items-center gap-2 mb-1">
             <MapPin size={10} className="text-orange-500" />
             <p className="text-[8px] uppercase tracking-widest text-slate-400 font-black">ALAMAT</p>
           </div>
           <p className="text-[10px] text-white leading-snug font-black uppercase">
             {data.ALAMAT || "N/A"}
           </p>
        </div>
      </div>
      
      <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-[8px] text-slate-400 font-black uppercase tracking-widest shrink-0">
        <span className="flex items-center gap-1"><Clock size={10} /> {data.BLTH}</span>
        <span className="truncate max-w-[120px]">{data.PETUGAS}</span>
      </div>
    </div>
  );
};

export default InfoPanel;
