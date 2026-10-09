import React from 'react';
import { Activity, ShieldCheck } from 'lucide-react';

interface MetroNode {
  name: string;
  country: string;
  x: number; // percentage
  y: number; // percentage
  status: string;
  sitesCount: number;
  uptime: string;
}

const NODES: MetroNode[] = [
  { name: 'Accra Ringway', country: 'GH', x: 28, y: 46, status: '100% Live', sitesCount: 28, uptime: '100% Verified' },
  { name: 'Lagos Island Corridor', country: 'NG', x: 38, y: 48, status: '100% Live', sitesCount: 72, uptime: '99.8% Uptime' },
  { name: 'Nairobi Westlands & Airport', country: 'KE', x: 67, y: 52, status: '100% Live', sitesCount: 64, uptime: '100% Uptime' },
  { name: 'Kigali & Kinshasa', country: 'RW/CD', x: 55, y: 56, status: '98.9% Live', sitesCount: 30, uptime: '98.9% Uptime' },
  { name: 'Johannesburg M1 Corridors', country: 'ZA', x: 57, y: 78, status: '99.1% Live', sitesCount: 54, uptime: '99.1% Uptime' },
];

export const AfricaCorridorMap: React.FC = () => {
  return (
    <div className="relative w-full h-[320px] bg-[#f8f7f4] rounded-2xl border border-[#eae7e1] overflow-hidden shadow-sm">
      {/* Background Stylized Africa Map SVG */}
      <svg
        viewBox="0 0 600 400"
        className="w-full h-full object-cover opacity-90"
      >
        {/* Subtle grid lines */}
        <defs>
          <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#e8e5df" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="600" height="400" fill="url(#grid)" />

        {/* Africa Continent Simplified Geometrical Silhouette */}
        <path
          d="M 170,70 
             Q 280,60 380,80 
             Q 450,110 470,160 
             Q 450,220 410,240 
             Q 420,290 380,340 
             Q 340,370 320,380 
             Q 300,370 280,310 
             Q 220,230 200,200 
             Q 130,190 140,150 
             Q 150,100 170,70 Z"
          fill="#ede8df"
          stroke="#ded7ca"
          strokeWidth="1.5"
        />

        {/* Inter-Metro Optical Telemetry Flight Routes */}
        {/* Accra to Lagos */}
        <line x1="168" y1="184" x2="228" y2="192" stroke="#ffffff" strokeWidth="2" strokeDasharray="3 3" />
        {/* Lagos to Nairobi */}
        <line x1="228" y1="192" x2="402" y2="208" stroke="#ef5a24" strokeWidth="2" strokeDasharray="4 3" opacity="0.45" />
        {/* Nairobi to Johannesburg */}
        <line x1="402" y1="208" x2="342" y2="312" stroke="#ef5a24" strokeWidth="2" strokeDasharray="4 3" opacity="0.45" />
        {/* Lagos to Johannesburg */}
        <line x1="228" y1="192" x2="342" y2="312" stroke="#ef5a24" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.3" />
      </svg>

      {/* Corridor Hub Nodes */}
      {NODES.map((node, i) => (
        <div
          key={i}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
        >
          {/* Signal Ping */}
          <div className="absolute -inset-2.5 rounded-full bg-[#ef5a24]/30 animate-ping pointer-events-none" />
          
          <div className="w-6 h-6 rounded-full bg-[#ef5a24] border-2 border-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-125">
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>

          {/* Node Floating Label */}
          <div className="absolute left-1/2 -translate-x-1/2 mt-1 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-lg border border-[#eae7e1] shadow-md text-center whitespace-nowrap pointer-events-none transition-all group-hover:scale-105">
            <p className="text-[10px] font-bold text-[#181716]">{node.name}</p>
            <p className="text-[9px] font-semibold text-emerald-700">{node.status} • {node.sitesCount} Sites</p>
          </div>
        </div>
      ))}

      {/* Bottom Status Legend */}
      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] font-medium bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-[#eae7e1]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[#181716]">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Optimal Health (100–98%)
          </span>
          <span className="flex items-center gap-1.5 text-zinc-600">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Telemetry Re-sync (&lt;98%)
          </span>
        </div>
        <span className="text-zinc-500 text-[10px] flex items-center gap-1">
          <Activity className="w-3 h-3 text-emerald-600" />
          Last satellite heartbeat sync: 18s ago
        </span>
      </div>
    </div>
  );
};
