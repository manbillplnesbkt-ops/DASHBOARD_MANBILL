
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
    { id: 'DASHBOARD', label: 'Prabayar', icon: LayoutDashboard },
    { id: 'TAGIHAN', label: 'Invoice', icon: FileText },
    { id: 'PEMUTUSAN', label: 'Pemutusan', icon: PowerOff },
    { id: 'P NOL', label: 'P-Nol', icon: CircleSlash },
    { id: 'PIUTANG', label: 'Piutang', icon: Wallet },
    { id: 'KINERJA', label: 'Kinerja', icon: BarChart3 },
    { id: 'ADMIN', label: 'Admin', icon: ShieldAlert, color: 'text-rose-400' },
  ];

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
                    ? 'bg-white/10 text-white' 
                    : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}
                `}
              >
                <Icon size={16} className={isActive ? 'text-indigo-400' : `${item.color || 'text-slate-600'} group-hover:text-indigo-400`} />
                <span className="text-[11px] font-bold tracking-wide">{item.label}</span>
                {isActive && (
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]"></div>
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
