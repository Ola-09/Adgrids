import React from 'react';
import {
  Globe2,
  Send,
  MapPin,
  ShieldCheck,
  Camera,
  Coins,
  Building2,
  Sliders,
  Sparkles,
  ChevronRight,
  Wifi,
  Shield,
  Layers,
} from 'lucide-react';
import { ScreenId } from '../../types';

interface LeftSidebarProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ currentScreen, onSelectScreen }) => {
  const isGovernance = currentScreen === 'screen-08';

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-[#faf9f6] border-r border-[#eae7e1] p-4 text-[#140338] select-none min-h-[calc(100vh-80px)]">
      {/* Top Section Header */}
      <div className="flex items-center justify-between px-2 py-2 mb-4 bg-white rounded-xl border border-[#eae7e1] shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#140338] text-white flex items-center justify-center text-xs">
            <Globe2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#140338] leading-none">Pan-African Fleet</h4>
            <p className="text-[10px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              6 Metros Active
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="space-y-1">
        {/* Governance console item if in governance screen */}
        {isGovernance && (
          <button
            onClick={() => onSelectScreen('screen-08')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs bg-white text-[#140338] shadow-2xs"
          >
            <Shield className="w-4 h-4" />
            <span>Governance Console</span>
          </button>
        )}

        <button
          onClick={() => onSelectScreen('screen-01')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-colors ${
            currentScreen === 'screen-01'
              ? 'bg-white text-[#140338] shadow-2xs'
              : 'text-zinc-600 hover:text-[#140338] hover:bg-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Send className="w-4 h-4" />
            <span>Campaign Flights</span>
          </div>
          {currentScreen === 'screen-01' && <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={() => onSelectScreen('screen-02')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-colors ${
            currentScreen === 'screen-02'
              ? 'bg-white text-[#140338] shadow-2xs'
              : 'text-zinc-600 hover:text-[#140338] hover:bg-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4" />
            <span>Live Map Tracker</span>
          </div>
        </button>

        <button
          onClick={() => onSelectScreen('screen-02')}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs text-zinc-600 hover:text-[#140338] hover:bg-white transition-colors"
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4" />
            <span>Fleet & Audits</span>
          </div>
        </button>

        <button
          onClick={() => onSelectScreen('screen-04')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-colors ${
            currentScreen === 'screen-04'
              ? 'bg-white text-[#140338] shadow-2xs'
              : 'text-zinc-600 hover:text-[#140338] hover:bg-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Camera className="w-4 h-4" />
            <span>Proof-of-Play</span>
          </div>
          <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-[#140338] text-white rounded-full">
            12
          </span>
        </button>

        <button
          onClick={() => onSelectScreen('screen-06')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-colors ${
            currentScreen === 'screen-06'
              ? 'bg-white text-[#140338] shadow-2xs'
              : 'text-zinc-600 hover:text-[#140338] hover:bg-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Coins className="w-4 h-4" />
            <span>Yield & Inventory</span>
          </div>
        </button>

        <button
          onClick={() => onSelectScreen('screen-08')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-colors ${
            currentScreen === 'screen-08'
              ? 'bg-white text-[#140338] shadow-2xs'
              : 'text-zinc-600 hover:text-[#140338] hover:bg-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Building2 className="w-4 h-4" />
            <span>Metro Hubs</span>
          </div>
        </button>
      </div>

      {/* Middle Spacer */}
      <div className="flex-1 my-4" />

      {/* Unbooked DOOH Slots Card */}
      <div className="p-3.5 bg-white rounded-2xl border border-[#eae7e1] shadow-2xs mb-4">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#140338] mb-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Unbooked DOOH Slots</span>
        </div>
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          18 prime highway LEDs open for 48h dynamic buys in Lagos & Nairobi.
        </p>
        <button
          onClick={() => onSelectScreen('screen-07')}
          className="w-full mt-2.5 py-2 px-3 bg-[#140338] hover:bg-[#200552] text-white text-xs font-bold rounded-xl transition-colors text-center"
        >
          Book Inventory
        </button>
      </div>

      {/* Bottom Telemetry & Settings */}
      <div className="pt-3 border-t border-[#eae7e1] space-y-2 text-xs font-semibold text-zinc-600">
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2">
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            <span>Telemetry Status</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <button
          onClick={() => onSelectScreen('screen-08')}
          className="w-full flex items-center gap-2 px-2 py-1 text-left text-zinc-500 hover:text-[#140338] transition-colors"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>System Settings</span>
        </button>
      </div>
    </aside>
  );
};
