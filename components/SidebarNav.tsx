
import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  PowerOff, 
  CircleSlash, 
  Wallet, 
  BarChart3,
  ChevronRight
} from 'lucide-react';

interface SidebarNavProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ activePage, onPageChange }) => {
  const menuItems = [
    { id: 'DASHBOARD', label: 'PRA BAYAR', icon: LayoutDashboard },
    { id: 'INVOICE', label: 'INVOICE', icon: FileText },
    { id: 'PEMUTUSAN', label: 'PEMUTUSAN', icon: PowerOff },
    { id: 'P NOL', label: 'P NOL', icon: CircleSlash },
    { id: 'PIUTANG', label: 'PIUTANG', icon: Wallet },
    { id: 'KINERJA', label: 'KINERJA', icon: BarChart3 },
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800 shadow-xl z-[1002] shrink-0">
      <div className="max-w-[1800px] mx-auto px-4 lg:px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-700 rounded-lg flex items-center justify-center shadow-lg shadow-orange-900/20">
            <LayoutDashboard className="text-white" size={18} />
          </div>
          <div className="hidden sm:block">
            <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em] leading-none">MANBILL MONITORING</h2>
            <p className="text-[8px] font-bold text-orange-500 uppercase tracking-widest mt-0.5">SYSTEM V4.2</p>
          </div>
        </div>
        
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`
                  flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all whitespace-nowrap group
                  ${isActive 
                    ? 'bg-orange-700 text-white shadow-lg shadow-orange-900/40 translate-y-[-1px]' 
                    : 'hover:bg-slate-800 text-slate-400 hover:text-white'}
                `}
              >
                <Icon size={14} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-orange-500'} />
                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-4 text-[9px] font-black text-slate-500 uppercase tracking-widest border-l border-slate-800 pl-6 ml-2">
           <div className="flex flex-col items-end">
              <span className="text-emerald-500">SYSTEM ONLINE</span>
              <span className="text-slate-600">SERVER-01</span>
           </div>
           <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default SidebarNav;
