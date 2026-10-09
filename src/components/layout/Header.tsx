import React from 'react';
import {
  Search,
  Radio,
  Bell,
  SlidersHorizontal,
  ChevronDown,
  Building2,
  Download,
  Plus,
  Compass,
  Layers,
  ArrowUpRight,
  Shield,
  Smartphone,
} from 'lucide-react';
import { ScreenId } from '../../types';

interface HeaderProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentScreen, onSelectScreen }) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#eae7e1] text-[#140338]">
      {/* Top Quick Screen Switcher Banner (Allows 1-click inspection of all 9 mockup screens) */}
      <div className="bg-[#140338] text-white px-4 py-1.5 flex items-center justify-between text-xs overflow-x-auto select-none border-b border-white/10">
        <div className="flex items-center gap-2 shrink-0 font-bold tracking-wide">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-white font-extrabold uppercase text-[11px] tracking-wider">AfriReach System:</span>
          <span className="text-zinc-300 text-[11px] font-normal hidden sm:inline">Active Screen Mode:</span>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
          {[
            { id: 'screen-01', num: '01', label: 'Operations Center' },
            { id: 'screen-02', num: '02', label: 'Field Dispatch' },
            { id: 'screen-03', num: '03', label: 'Executive Deck' },
            { id: 'screen-04', num: '04', label: 'Client Tracker' },
            { id: 'screen-05', num: '05', label: 'Mobile Field OS' },
            { id: 'screen-06', num: '06', label: 'Finance & Treasury' },
            { id: 'screen-07', num: '07', label: 'Media Owner' },
            { id: 'screen-08', num: '08', label: 'Governance Admin' },
            { id: 'screen-09', num: '09', label: 'Contractor Hub' },
          ].map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectScreen(item.id as ScreenId)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-[#140338] shadow-sm font-bold'
                    : 'text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className={`text-[10px] ${isActive ? 'text-[#140338] font-black' : 'text-white'}`}>
                  {item.num}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main App Navigation Bar (Tailored to current role context) */}
      <div className="px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            onClick={() => onSelectScreen('screen-01')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#140338] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-[#140338]">ADGRID</span>
                {currentScreen === 'screen-04' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-semibold">
                    v4.8
                  </span>
                )}
              </div>
              <p className="text-[9px] font-bold tracking-widest text-zinc-600 uppercase">
                {currentScreen === 'screen-07'
                  ? 'Owner Console'
                  : currentScreen === 'screen-08'
                  ? 'Platform Admin'
                  : currentScreen === 'screen-09'
                  ? 'Vendor Operations Hub'
                  : currentScreen === 'screen-06'
                  ? 'Finance & Treasury'
                  : currentScreen === 'screen-02'
                  ? 'Fleet & Audit Operations'
                  : 'Pan-African Engine'}
              </p>
            </div>
          </div>

          {/* Context Workspace Pill */}
          {currentScreen === 'screen-02' && (
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs font-semibold">
              <span className="text-zinc-500">Workspace:</span>
              <span className="text-[#140338]">Pan-African Metros</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                6 Hubs Live
              </span>
            </div>
          )}

          {currentScreen === 'screen-03' && (
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[#140338]">Safaricom Global – Africa Media Group</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </div>
          )}

          {currentScreen === 'screen-09' && (
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#eae7e1] bg-emerald-50 text-emerald-900 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              Verified Tier-1 Contractor • ARC-NG-9410
            </div>
          )}
        </div>

        {/* Global Search Bar (Present on desktop screens) */}
        <div className="hidden md:flex flex-1 max-w-md items-center relative">
          <Search className="w-4 h-4 text-zinc-600 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder={
              currentScreen === 'screen-06'
                ? 'Search disbursements, WHT, agency accounts...'
                : currentScreen === 'screen-07'
                ? 'Search site ID, corridor, flight name...'
                : currentScreen === 'screen-09'
                ? 'Search PO #, site ID, gantry corridor...'
                : 'Search flights, inventory ID, coordinates...'
            }
            className="w-full pl-9 pr-12 py-1.5 bg-[#f4f3f0] hover:bg-[#efeeeb] focus:bg-white text-xs text-[#140338] placeholder-zinc-600 rounded-xl border border-[#eae7e1] focus:outline-none focus:ring-2 focus:ring-[#140338]/20 transition-all"
          />
          <kbd className="absolute right-3 px-1.5 py-0.5 rounded text-[10px] font-mono bg-white border border-zinc-200 text-zinc-500 shadow-2xs">
            ⌘K
          </kbd>
        </div>

        {/* Center / Navigation Links (Interactive tabs to toggle role views) */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-zinc-600">
          <button
            onClick={() => onSelectScreen('screen-01')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              currentScreen === 'screen-01' ? 'bg-[#140338] text-white font-bold' : 'hover:bg-zinc-100 hover:text-[#140338]'
            }`}
          >
            Agency Command
          </button>

          <button
            onClick={() => onSelectScreen('screen-04')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              currentScreen === 'screen-04' ? 'bg-[#140338] text-white font-bold' : 'hover:bg-zinc-100 hover:text-[#140338]'
            }`}
          >
            <span>Customer View</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          </button>

          <button
            onClick={() => onSelectScreen('screen-07')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              currentScreen === 'screen-07' ? 'bg-[#140338] text-white font-bold' : 'hover:bg-zinc-100 hover:text-[#140338]'
            }`}
          >
            Metros & Inventory
          </button>

          <button
            onClick={() => onSelectScreen('screen-02')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              currentScreen === 'screen-02' ? 'bg-[#140338] text-white font-bold' : 'hover:bg-zinc-100 hover:text-[#140338]'
            }`}
          >
            Live Operations
          </button>

          <button
            onClick={() => onSelectScreen('screen-06')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              currentScreen === 'screen-06' ? 'bg-[#140338] text-white font-bold' : 'hover:bg-zinc-100 hover:text-[#140338]'
            }`}
          >
            <span>Analytics</span>
            {currentScreen === 'screen-06' && (
              <span className="px-1.5 py-0.5 rounded bg-white text-[#140338] text-[9px] font-black uppercase">
                Treasury
              </span>
            )}
          </button>
        </nav>

        {/* Right Tools & Context Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Action button in screen 02 */}
          {currentScreen === 'screen-02' && (
            <button
              onClick={() => alert('Dispatch Crew Modal: Connecting to nearest available field auditor.')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-100 text-[#140338] border border-zinc-200 text-xs font-bold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Dispatch</span>
            </button>
          )}

          {/* Action button in screen 03 */}
          {currentScreen === 'screen-03' && (
            <button
              onClick={() => alert('Generating Board Summary Executive Deck (PDF)...')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-100 text-[#140338] border border-zinc-200 text-xs font-bold shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Board Deck</span>
            </button>
          )}

          {/* Action button in screen 09 */}
          {currentScreen === 'screen-09' && (
            <button
              onClick={() => alert('Accepting Work Order #JOB-8846...')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-100 text-[#140338] border border-zinc-200 text-xs font-bold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Accept Work Order</span>
            </button>
          )}

          {/* Telemetry broadcast status */}
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#f4f3f0] hover:bg-zinc-200 text-[#140338] cursor-pointer" title="Telemetry Relay Online">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
          </div>

          {/* Notifications */}
          <div className="relative w-8 h-8 rounded-xl flex items-center justify-center bg-[#f4f3f0] hover:bg-zinc-200 text-[#140338] cursor-pointer" title="Alerts">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
              4
            </span>
          </div>

          {/* Sliders / Quick settings */}
          <div className="hidden sm:flex w-8 h-8 rounded-xl items-center justify-center bg-[#f4f3f0] hover:bg-zinc-200 text-[#140338] cursor-pointer">
            <SlidersHorizontal className="w-4 h-4 text-zinc-600" />
          </div>

          {/* User Profile Avatar */}
          <div
            onClick={() => onSelectScreen('screen-05')}
            className="flex items-center gap-2 pl-2 border-l border-zinc-200 cursor-pointer group"
            title="Switch to Mobile Field Auditor View"
          >
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
              alt="Babatunde Oladipo"
              className="w-8 h-8 rounded-xl object-cover ring-2 ring-transparent group-hover:ring-white transition-all"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
