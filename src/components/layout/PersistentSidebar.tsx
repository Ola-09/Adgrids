import React from 'react';
import {
  LayoutDashboard,
  Megaphone,
  Building,
  Store,
  CalendarCheck,
  Wrench,
  ShieldCheck,
  Truck,
  CreditCard,
  BarChart3,
  Sparkles,
  Users,
  Settings,
  Activity,
  MapPin,
  Compass,
  FileText,
  DollarSign,
  Lock,
  CheckCircle2,
  Camera,
  AlertTriangle,
  Briefcase,
  Navigation,
  CheckCircle,
  User,
  Layers,
  Clock,
  Star,
  Building2,
  FileCheck,
  ShieldAlert,
  LogOut,
  Globe,
  HelpCircle,
} from 'lucide-react';
import { UserRole } from '../../types';
import { ROLE_NAVIGATION_MAP } from '../../data/authAccounts';
import { useAuth } from '../../context/AuthContext';

interface PersistentSidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onNavigatePublicMarketplace: () => void;
}

// Icon dictionary
const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Megaphone,
  Building,
  Store,
  CalendarCheck,
  Wrench,
  ShieldCheck,
  Truck,
  CreditCard,
  BarChart3,
  Sparkles,
  Users,
  Settings,
  Activity,
  MapPin,
  Compass,
  FileText,
  DollarSign,
  Lock,
  CheckCircle2,
  Camera,
  AlertTriangle,
  Briefcase,
  Navigation,
  CheckCircle,
  User,
  Layers,
  Clock,
  Star,
  Building2,
  FileCheck,
  ShieldAlert,
};

export const PersistentSidebar: React.FC<PersistentSidebarProps> = ({
  activeTab,
  onSelectTab,
  onNavigatePublicMarketplace,
}) => {
  const { currentUser, logout } = useAuth();

  if (!currentUser) return null;

  const navItems = ROLE_NAVIGATION_MAP[currentUser.role] || [];

  return (
    <aside
      className="shrink-0 bg-white text-zinc-900 flex flex-col justify-between border-r border-[#eae7e1] select-none transition-all duration-200 z-40 
      w-16 md:w-56 lg:w-64 min-h-screen sticky top-0"
      aria-label="Platform Sidebar Navigation"
    >
      {/* Top Header & Brand */}
      <div className="p-3 md:p-4 border-b border-[#eae7e1]">
        <div className="flex items-center justify-center md:justify-start gap-3">
          {/* Logo Mark in orange */}
          <div className="w-10 h-10 rounded-xl bg-[#ef5a24] text-white flex items-center justify-center shrink-0 shadow-md">
            <span className="font-extrabold text-white text-lg tracking-tighter">AO</span>
          </div>

          {/* Desktop/Tablet Logo text */}
          <div className="hidden md:block min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm tracking-tight text-[#181716] block truncate">
                ADGRID
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#ef5a24] text-white font-black uppercase">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 truncate leading-tight font-medium">
              Pan-African OOH OS
            </p>
          </div>
        </div>

        {/* Tenant Organization Tag */}
        <div className="hidden md:block mt-3 px-2.5 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#ef5a24] block">
            Workspace
          </span>
          <p className="text-xs font-bold text-[#181716] truncate" title={currentUser.organization}>
            {currentUser.organization}
          </p>
        </div>
      </div>

      {/* Dynamic Role-Based Navigation Items */}
      <div className="flex-1 py-3 px-2 md:px-3 overflow-y-auto space-y-1 scrollbar-none">
        <div className="hidden md:block px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
          {currentUser.role} Menu
        </div>

        {navItems.map((item) => {
          const Icon = ICON_MAP[item.icon] || LayoutDashboard;
          const isActive = activeTab === item.tabId;

          return (
            <button
              key={item.tabId}
              onClick={() => onSelectTab(item.tabId)}
              title={item.label}
              className={`w-full flex items-center justify-center md:justify-start gap-3 px-2.5 py-2 rounded-xl text-xs font-bold transition-all group relative cursor-pointer ${
                isActive
                  ? 'bg-[#fff5f2] text-[#ef5a24] font-black border-l-4 border-[#ef5a24] shadow-xs'
                  : 'text-zinc-600 hover:text-[#181716] hover:bg-zinc-50'
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${
                  isActive ? 'text-[#ef5a24]' : 'text-zinc-400 group-hover:text-zinc-700'
                }`}
              />

              {/* Label for Tablet/Desktop */}
              <span className="hidden md:inline truncate">{item.label}</span>

              {/* Mobile Tooltip on Hover */}
              <span className="md:hidden absolute left-14 ml-2 px-2.5 py-1 bg-[#181716] text-white text-[11px] font-bold rounded-lg shadow-xl border border-zinc-700 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Public Marketplace Quick-Switch Button */}
        <div className="pt-2 mt-2 border-t border-[#eae7e1]">
          <button
            onClick={onNavigatePublicMarketplace}
            title="Public Marketplace"
            className="w-full flex items-center justify-center md:justify-start gap-3 px-2.5 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:text-[#ef5a24] hover:bg-zinc-50 transition-colors group relative cursor-pointer"
          >
            <Globe className="w-5 h-5 shrink-0 text-zinc-400 group-hover:text-[#ef5a24]" />
            <span className="hidden md:inline truncate">Public Marketplace</span>

            <span className="md:hidden absolute left-14 ml-2 px-2.5 py-1 bg-[#181716] text-white text-[11px] font-bold rounded-lg shadow-xl border border-zinc-700 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
              Public Marketplace
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Profile & Sign Out */}
      <div className="p-2 md:p-3 border-t border-[#eae7e1] bg-zinc-50/60 space-y-2">
        {/* User Profile Card */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-8 h-8 rounded-xl object-cover ring-1 ring-zinc-200 shrink-0"
            />
            <div className="hidden md:block min-w-0">
              <p className="text-xs font-bold text-[#181716] truncate leading-tight">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-zinc-500 truncate">{currentUser.email}</p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-[#ef5a24] hover:bg-zinc-100 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden lg:inline text-[10px] font-bold">Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
