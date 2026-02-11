
import React from 'react';
import { Construction, AlertCircle } from 'lucide-react';

interface PagePlaceholderProps {
  title: string;
}

const PagePlaceholder: React.FC<PagePlaceholderProps> = ({ title }) => {
  return (
    <div className="bg-white border-2 border-slate-300 rounded-2xl flex flex-col items-center justify-center p-12 min-h-[600px] shadow-xl text-center">
      <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl shadow-slate-200">
        <Construction size={48} className="text-orange-500" />
      </div>
      <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4 italic">
        HALAMAN <span className="text-orange-700">{title}</span>
      </h2>
      <div className="max-w-md space-y-4">
        <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest leading-relaxed">
          Sistem sedang dalam proses integrasi data modul "{title}". Fitur ini akan segera tersedia pada pembaruan versi berikutnya.
        </p>
        <div className="flex items-center justify-center gap-3 bg-slate-100 p-4 rounded-xl border border-slate-200">
          <AlertCircle size={18} className="text-indigo-600" />
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">UNDER DEVELOPMENT • CORE v3.0</span>
        </div>
      </div>
    </div>
  );
};

export default PagePlaceholder;
