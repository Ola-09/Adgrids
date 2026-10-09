import React, { useEffect, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Building2,
  CalendarCheck,
  FileText,
  Layers,
  Lock,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { KPICard } from '../../shared/KPICard';
import { TableSkeleton } from '../../shared/LoadingSkeleton';

interface PlatformAdminOverviewProps {
  onNavigateTab: (tabId: string) => void;
}

export const PlatformAdminOverview: React.FC<PlatformAdminOverviewProps> = ({ onNavigateTab }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/platform/overview', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || ''}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setData(json.stats);
      }
    } catch (err) {
      console.error('Error fetching platform admin overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const stats = data || {};

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#eae7e1]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#181716] tracking-tight">
              Platform Governance & Infrastructure Command
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              Multi-Tenant Authority
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Pan-African tenant provisioning, user identity access management, immutable audit trails, and policy enforcement.
          </p>
        </div>

        <button
          onClick={fetchOverview}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-50 border border-[#eae7e1] text-xs font-semibold text-zinc-700 shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* 5 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KPICard
          label="Tenants & Organizations"
          value={`${stats.tenantsCount || 0}`}
          subValue="Agencies, owners & clients"
          icon={Building2}
          onClick={() => onNavigateTab('tenants')}
        />
        <KPICard
          label="Provisioned Users"
          value={`${stats.usersCount || 0}`}
          subValue="RBAC secured accounts"
          icon={Users}
          onClick={() => onNavigateTab('users')}
        />
        <KPICard
          label="Active Flight Campaigns"
          value={`${stats.campaignsCount || 0}`}
          subValue="Cross-border OOH flights"
          icon={Layers}
        />
        <KPICard
          label="Concession Bookings"
          value={`${stats.bookingsCount || 0}`}
          subValue="Escrow contract records"
          icon={CalendarCheck}
        />
        <KPICard
          label="Security Audit Logs"
          value={`${stats.auditLogsCount || 0}`}
          subValue="Cryptographic tamper-proof"
          icon={ShieldCheck}
          onClick={() => onNavigateTab('audit-logs')}
        />
      </div>

      {/* Quick Access Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-[#eae7e1] p-5 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-[#181716]">Organization Governance</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Audit registered media agencies, concessionaire owners, technical vendors, and enterprise advertisers across African nodes.
          </p>
          <button
            onClick={() => onNavigateTab('tenants')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#ef5a24] hover:underline cursor-pointer pt-1"
          >
            <span>Manage Organizations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-[#eae7e1] p-5 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-[#181716]">User Identity & Roles</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Inspect session statuses, multi-factor authentication (MFA) compliance, email verification state, and privileged role delegations.
          </p>
          <button
            onClick={() => onNavigateTab('users')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#ef5a24] hover:underline cursor-pointer pt-1"
          >
            <span>Manage Platform Users</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-[#eae7e1] p-5 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-[#181716]">Audit Trail & Security</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Real-time compliance feed capturing logins, privilege changes, booking approvals, field verifications, and financial releases.
          </p>
          <button
            onClick={() => onNavigateTab('audit-logs')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#ef5a24] hover:underline cursor-pointer pt-1"
          >
            <span>Inspect Audit Logs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
