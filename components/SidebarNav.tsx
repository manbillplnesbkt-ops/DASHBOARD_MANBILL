
import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  PowerOff, 
  CircleSlash, 
  Wallet, 
  BarChart3,
  ShieldAlert,
  Cpu
} from 'lucide-react';

interface SidebarNavProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ activePage, onPageChange }) => {
  const menuItems = [
    { id: 'DASHBOARD', label: 'PRABAYAR', icon: LayoutDashboard },
    { id: 'TAGIHAN', label: 'INVOICE', icon: FileText },
    { id: 'PEMUTUSAN', label: 'PEMUTUSAN', icon: PowerOff },
    { id: 'P NOL', label: 'P-NOL', icon: CircleSlash },
    { id: 'PIUTANG', label: 'PIUTANG', icon: Wallet },
    { id: 'KINERJA', label: 'KINERJA', icon: BarChart3 },
    { id: 'ADMIN', label: 'ADMIN', icon: ShieldAlert },
  ];

  // Warna Biru Terang untuk Aktif: text-sky-400
  // Warna Putih untuk Dasar: text-white

  return (
    <div className="bg-slate-950 border-b border-white/5 shadow-2xl z-[1002] shrink-0">
      <div className="max-w-[1920px] mx-auto px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-white/10">
            <Cpu className="text-white" size={22} />
          </div>
          <div className="hidden md:block">
            <h2 className="text-xs font-black text-white uppercase tracking-[0.2em] leading-none">DASHBOARD MANBILL PLN ES BUKITTINGGI</h2>
            <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-1">v7.5 Enterprise v.2</p>
          </div>
        </div>
        
        <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`
                  flex items-center gap-2.5 px-5 py-2.5 rounded-xl transition-all whitespace-nowrap group relative
                  ${isActive 
                    ? `bg-sky-500/10 text-sky-400 shadow-sm border border-white/10` 
                    : 'text-white hover:bg-white/5'}
                `}
              >
                <Icon 
                  size={16} 
                  className={`${isActive ? 'text-sky-400' : 'text-white/60 group-hover:text-white'} group-hover:scale-110 transition-transform`} 
                />
                <span className={`text-[11px] font-black tracking-widest ${isActive ? 'text-sky-400' : 'text-white'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]"></div>
                )}
              </button>
            );
          })}
        </nav>

        <div className="hidden xl:flex items-center gap-5 border-l border-white/10 pl-8">
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                SISTEM AKTIF
              </span>
              <span className="text-[9px] font-bold text-slate-500 mt-0.5 tracking-tighter">NODE: BPLN ES BKT</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarNav;
