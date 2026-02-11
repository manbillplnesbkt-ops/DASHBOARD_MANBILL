
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
    { id: 'DASHBOARD', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'INVOICE', label: 'INVOICE', icon: FileText },
    { id: 'PEMUTUSAN', label: 'PEMUTUSAN', icon: PowerOff },
    { id: 'P NOL', label: 'P NOL', icon: CircleSlash },
    { id: 'PIUTANG', label: 'PIUTANG', icon: Wallet },
    { id: 'KINERJA', label: 'KINERJA', icon: BarChart3 },
  ];

  return (
    <div className="bg-white border-2 border-slate-300 rounded-2xl overflow-hidden shadow-lg flex flex-col">
      <div className="bg-slate-900 p-4 border-b border-slate-800">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">MENU UTAMA</h2>
      </div>
      <nav className="p-2 flex flex-col gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`
                flex items-center justify-between p-4 rounded-xl transition-all group
                ${isActive 
                  ? 'bg-orange-700 text-white shadow-lg shadow-orange-200' 
                  : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'}
              `}
            >
              <div className="flex items-center gap-4">
                <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-600'} />
                <span className="text-[12px] font-black uppercase tracking-widest">{item.label}</span>
              </div>
              <ChevronRight size={16} className={`transition-transform ${isActive ? 'translate-x-1 opacity-100' : 'opacity-0'}`} />
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default SidebarNav;
