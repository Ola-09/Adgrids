import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  Maximize2,
  Minimize2,
  RotateCw,
  Sun,
  Moon,
  Eye,
  Info,
  X,
  Sparkles,
  Layers,
  Lock,
} from 'lucide-react';
import { MarketplaceBillboard } from '../../types';
import { useEntitlements } from '../../context/EntitlementContext';

interface Billboard360ViewerProps {
  billboard: MarketplaceBillboard;
  isOpen: boolean;
  onClose: () => void;
}

export const Billboard360Viewer: React.FC<Billboard360ViewerProps> = ({
  billboard,
  isOpen,
  onClose,
}) => {
  const { hasEntitlement, openUpgradeModal } = useEntitlements();
  const canView360 = hasEntitlement('can_view_360');

  // Panoramic interaction state
  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isNightMode, setIsNightMode] = useState(false);
  const [showObstructionGuide, setShowObstructionGuide] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-rotation when idle
  useEffect(() => {
    if (!isOpen || !canView360 || isDragging) return;
    const interval = setInterval(() => {
      setRotationX((prev) => (prev + 0.15) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [isOpen, canView360, isDragging]);

  if (!isOpen) return null;

  // If user lacks entitlement: show upgrade gate modal, DO NOT expose 360 content!
  if (!canView360) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
        <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 border border-[#eae7e1] shadow-2xl space-y-4">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-[#ef5a24]/10 text-[#ef5a24] flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#ef5a24]">
              Premium Media Capability
            </span>
            <h2 className="text-xl font-black text-[#181716] tracking-tight mt-0.5">
              360° Billboard Environment Experience
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Inspect the billboard environment virtually before committing to inventory.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#fffaf8] border border-[#ef5a24]/20 space-y-2 text-xs">
            <p className="font-bold text-[#181716]">
              360° location viewing is available on Professional and Enterprise plans.
            </p>
            <p className="text-zinc-600">
              Virtually stand at driver and pedestrian eye levels along the {billboard.corridor} corridor to evaluate sightlines, tree canopies, lighting conditions, and traffic flow.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                openUpgradeModal('can_view_360');
              }}
              className="px-5 py-2 rounded-xl bg-[#ef5a24] hover:bg-[#d94e1d] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Upgrade Plan</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mouse handlers for panoramic drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setRotationX((prev) => (prev + deltaX * 0.4) % 360);
    setRotationY((prev) => Math.max(-45, Math.min(45, prev - deltaY * 0.3)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const compassHeading = Math.round(((360 - rotationX) % 360 + 360) % 360);
  const cardinalDirection =
    compassHeading >= 315 || compassHeading < 45
      ? 'North (Arterial Inbound)'
      : compassHeading >= 45 && compassHeading < 135
      ? 'East (Cross-Traffic)'
      : compassHeading >= 135 && compassHeading < 225
      ? 'South (Arterial Outbound)'
      : 'West (Transit Depot)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-6xl h-[86vh] bg-[#121212] rounded-3xl overflow-hidden border border-white/20 shadow-2xl flex flex-col">
        {/* Top Floating Control Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-3 bg-black/70 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 pointer-events-auto">
            <Compass className="w-5 h-5 text-[#ef5a24] animate-spin-slow" />
            <div>
              <div className="text-white text-xs font-black flex items-center gap-2">
                <span>{billboard.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ef5a24]/30 text-[#ff8152] border border-[#ef5a24]/40">
                  360° Live Virtual Sphere
                </span>
              </div>
              <div className="text-zinc-400 text-[11px] font-mono">
                Heading: {compassHeading}° • {cardinalDirection}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => setIsNightMode(!isNightMode)}
              className="p-2.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
              title={isNightMode ? 'Switch to Day Light' : 'Switch to High-Lumen Night View'}
            >
              {isNightMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-300" />}
            </button>
            <button
              onClick={() => setShowObstructionGuide(!showObstructionGuide)}
              className={`p-2.5 rounded-xl backdrop-blur-md border transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5 ${
                showObstructionGuide
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-black/70 text-zinc-400 border-white/10'
              }`}
              title="Toggle Line-of-Sight Driver Cone"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Line of Sight</span>
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 360 Panoramic Viewport */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`flex-1 relative cursor-grab overflow-hidden flex items-center justify-center ${
            isDragging ? 'cursor-grabbing' : ''
          }`}
          style={{
            perspective: '1000px',
            backgroundColor: isNightMode ? '#0a0d14' : '#1e2430',
          }}
        >
          {/* Panoramic Cylinder / Backdrop Image */}
          <div
            className="absolute inset-0 transition-transform duration-75 ease-out"
            style={{
              backgroundImage: `url(${
                isNightMode && billboard.nightUrl ? billboard.nightUrl : billboard.previewUrl
              })`,
              backgroundSize: 'cover',
              backgroundPosition: `${rotationX % 100}% ${50 + rotationY * 0.5}%`,
              filter: isNightMode ? 'brightness(0.7) contrast(1.2)' : 'brightness(1.0)',
              transform: `scale(${zoom})`,
            }}
          />

          {/* Simulated 3D Horizon & Corridor Overlay */}
          <div className="absolute inset-0 pointer-events-none bg-linear-to-t from-black/80 via-transparent to-black/60" />

          {/* Line of Sight Driver Cone Overlay */}
          {showObstructionGuide && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-[420px] h-[280px] border-2 border-dashed border-emerald-400/60 rounded-3xl relative animate-pulse flex items-center justify-center">
                <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[10px] font-mono text-emerald-300">
                  DRIVING SIGHTLINE • 100% UNVAILED CONE
                </div>
                <div className="text-center p-3 bg-black/60 backdrop-blur-xs rounded-xl border border-white/10">
                  <div className="text-white text-xs font-bold">Optimal Commuter FOV</div>
                  <div className="text-zinc-400 text-[10px] font-mono mt-0.5">
                    Dwell: {billboard.dwellTimeSeconds || 45}s • Traffic: {billboard.dailyTrafficVehicles?.toLocaleString() || '45,000'} vehicles/day
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Drag Hint */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 text-white text-xs font-medium flex items-center gap-2 pointer-events-none">
            <RotateCw className="w-3.5 h-3.5 text-[#ef5a24]" />
            <span>Click and drag left/right to pan 360° along {billboard.corridor}</span>
          </div>

          {/* Zoom controls */}
          <div className="absolute bottom-6 right-6 flex items-center gap-1.5 bg-black/70 backdrop-blur-md p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setZoom((z) => Math.max(0.8, z - 0.1))}
              className="px-2.5 py-1 text-white hover:bg-white/10 rounded-xl text-xs font-mono font-bold"
            >
              -
            </button>
            <span className="text-[11px] font-mono text-zinc-300 px-1">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(1.8, z + 0.1))}
              className="px-2.5 py-1 text-white hover:bg-white/10 rounded-xl text-xs font-mono font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* Bottom Metadata Ribbon */}
        <div className="p-4 bg-[#181716] border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4 text-zinc-300">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block font-bold">Coordinates</span>
              <span className="font-mono text-white text-[11px]">{billboard.lat}, {billboard.lng}</span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block font-bold">Structure Format</span>
              <span className="text-white font-bold">{billboard.format} ({billboard.dimensions})</span>
            </div>
            <div className="h-6 w-px bg-white/10 hidden sm:block" />
            <div className="hidden sm:block">
              <span className="text-[10px] text-zinc-500 uppercase block font-bold">Lighting Engine</span>
              <span className="text-emerald-400 font-semibold">{billboard.lightingType || 'High-Lumen Digital LED'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Verified 360° Telemetry Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
