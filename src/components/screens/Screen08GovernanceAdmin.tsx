import React from 'react';
import {
  Shield,
  Server,
  Key,
  Users,
  Activity,
  CheckCircle2,
  Lock,
  Globe2,
  RefreshCw,
  Plus,
  Radio,
  Cpu,
} from 'lucide-react';
import { ScreenId } from '../../types';

interface Screen08Props {
  onNavigate: (screen: ScreenId) => void;
}

export const Screen08GovernanceAdmin: React.FC<Screen08Props> = ({ onNavigate }) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#140338] tracking-tight">
              Platform Governance & Administration
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Pan-African Multi-Tenant Cluster Nominal
            </span>
          </div>
          <p className="text-xs lg:text-sm text-zinc-500 mt-1 font-medium">
            Tenant provisioning, cryptographic proof validation keys, satellite telemetry relays, and role-based access control.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert('Provision New Enterprise Tenant modal opened.')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-zinc-100 rounded-xl text-xs font-black text-[#140338] shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Provision New Tenant</span>
          </button>

          <button
            onClick={() => alert('Rotating cryptographic keys across all edge nodes...')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-[#eae7e1] hover:bg-zinc-50 rounded-xl text-xs font-bold text-[#140338] shadow-2xs"
          >
            <Key className="w-4 h-4 text-zinc-600" />
            <span>Rotate API Keys</span>
          </button>
        </div>
      </div>

      {/* 4 PRIMARY ADMIN METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Multi-Tenant Organizations</span>
            <div className="w-8 h-8 rounded-xl bg-[#f4f3f0] flex items-center justify-center text-[#140338]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#140338] tracking-tight tnum block">
              38 Active
            </span>
            <div className="mt-3 text-xs text-zinc-600">
              Agencies, Brands, Media Owners (1,420 Seats)
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Cryptographic Proof Logs</span>
            <div className="w-8 h-8 rounded-xl bg-[#f4f3f0] flex items-center justify-center text-emerald-600">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#140338] tracking-tight tnum block">
              482,100
            </span>
            <div className="mt-3 text-xs text-emerald-700 font-bold">
              SHA-256 + GNSS Hash Stamped (100% Verified)
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">IoT Edge Device Mesh</span>
            <div className="w-8 h-8 rounded-xl bg-[#f4f3f0] flex items-center justify-center text-[#140338]">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#140338] tracking-tight tnum block">
              2,840 Nodes
            </span>
            <div className="mt-3 text-xs text-zinc-600">
              Sensors, Lux Meters, Cameras (99.98% Ping)
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Global Gateway Latency</span>
            <div className="w-8 h-8 rounded-xl bg-[#f4f3f0] flex items-center justify-center text-emerald-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-emerald-700 tracking-tight tnum block">
              24ms Avg
            </span>
            <div className="mt-3 text-xs text-zinc-600">
              Lagos, Nairobi, JNB, AWS Cape Town Edge
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Hubs & RBAC (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Pan-African Metro Hub Management */}
          <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider block">
                  Regional Cluster Infrastructure
                </span>
                <h3 className="font-extrabold text-base text-[#140338]">
                  Pan-African Metro Hub Management
                </h3>
              </div>
              <Globe2 className="w-4 h-4 text-zinc-400" />
            </div>

            <div className="space-y-3">
              {[
                { name: 'West Africa Hub', code: 'Lagos (LOS) & Accra (ACC)', tenants: '18 Tenants', sites: '196 Sites', status: 'Healthy', ping: '18ms' },
                { name: 'East Africa Hub', code: 'Nairobi (NBO) & Kigali (KGL)', tenants: '12 Tenants', sites: '134 Sites', status: 'Healthy', ping: '22ms' },
                { name: 'Southern Africa Hub', code: 'Johannesburg (JNB)', tenants: '8 Tenants', sites: '114 Sites', status: 'Healthy', ping: '14ms' },
              ].map((hub) => (
                <div
                  key={hub.name}
                  className="p-3.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-extrabold text-sm text-[#140338]">{hub.name}</h4>
                    <p className="text-xs text-zinc-500">{hub.code}</p>
                    <p className="text-[11px] text-zinc-600 mt-0.5">
                      {hub.tenants} • {hub.sites}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {hub.status}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">Latency: {hub.ping}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Role-Based Access Control (RBAC) */}
          <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#140338]">
                Role-Based Access Control (RBAC) Matrix
              </h3>
              <Lock className="w-4 h-4 text-zinc-400" />
            </div>

            <div className="space-y-2 text-xs">
              {[
                { role: 'Agency Admin', perm: 'Full dispatch, PoP approval, campaign flights creation' },
                { role: 'Advertiser Brand Manager', perm: 'Read-only live tracker, proof inspection, report export' },
                { role: 'Media Owner Concessionaire', perm: 'Inventory management, yield pricing, RFQ acceptance' },
                { role: 'Tier-1 Contractor / Printer', perm: 'Assigned job orders, proof upload, fabrication queue' },
                { role: 'Field Auditor Operative', perm: 'Mobile OS capture, GPS geofence lock, lux reading' },
              ].map((item) => (
                <div key={item.role} className="p-2.5 rounded-xl bg-[#faf9f6] border border-[#eae7e1] flex justify-between">
                  <span className="font-bold text-[#140338]">{item.role}</span>
                  <span className="text-zinc-500 truncate max-w-xs">{item.perm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Security & Relays (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Infrastructure Health & Satellite Relays */}
          <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs space-y-3">
            <h3 className="font-extrabold text-base text-[#140338]">
              Satellite Relays & Optical Mesh
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#faf9f6] border border-[#eae7e1]">
                <div className="flex justify-between font-bold text-[#140338]">
                  <span>Primary Sat Relay 3B (Ku-Band)</span>
                  <span className="text-emerald-700">Online (0.4s)</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5">High availability geo-redundant link</p>
              </div>

              <div className="p-3 rounded-xl bg-[#faf9f6] border border-[#eae7e1]">
                <div className="flex justify-between font-bold text-[#140338]">
                  <span>Cellular RTK Differential GPS Mesh</span>
                  <span className="text-emerald-700">99.4% Precision</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5">Sub-meter accuracy across African metros</p>
              </div>

              <div className="p-3 rounded-xl bg-[#faf9f6] border border-[#eae7e1]">
                <div className="flex justify-between font-bold text-[#140338]">
                  <span>Optical CV Processing Cluster</span>
                  <span className="text-emerald-700">80ms / frame</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5">Hardware-accelerated edge inference</p>
              </div>
            </div>
          </div>

          {/* Compliance & Security Audit Log */}
          <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs space-y-3">
            <h3 className="font-extrabold text-base text-[#140338]">
              Immutable Audit Telemetry Stream
            </h3>

            <div className="space-y-2 text-xs font-mono text-zinc-600">
              <div className="p-2 rounded-lg bg-zinc-100 text-[11px]">
                <span className="text-[#140338] font-bold">14:12:08 WAT:</span> ISO 20560 Blockchain Snapshot #84920 generated.
              </div>
              <div className="p-2 rounded-lg bg-zinc-100 text-[11px]">
                <span className="text-[#140338] font-bold">13:40:22 WAT:</span> Escrow release authenticated via multi-sig key.
              </div>
              <div className="p-2 rounded-lg bg-zinc-100 text-[11px]">
                <span className="text-[#140338] font-bold">11:20:15 WAT:</span> Tier-1 Contractor credentials provisioned for Lagos Fleet.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
