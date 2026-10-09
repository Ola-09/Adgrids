import React, { useEffect, useState } from 'react';
import { Building2, Globe, MapPin, RefreshCw, Search, Users } from 'lucide-react';
import { TableSkeleton } from '../../shared/LoadingSkeleton';

export const PlatformOrganizations: React.FC = () => {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/platform/organizations', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || ''}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setOrganizations(json.organizations || []);
      }
    } catch (err) {
      console.error('Error fetching organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const filtered = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      (org.city && org.city.toLowerCase().includes(search.toLowerCase())) ||
      (org.type && org.type.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#eae7e1]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#181716] tracking-tight">
              Tenants & Organization Governance
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-bold text-xs">
              {organizations.length} Tenants
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Registered agencies, concessionaires, technical vendors, and corporate advertisers with isolated tenant workspaces.
          </p>
        </div>

        <button
          onClick={fetchOrgs}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-50 border border-[#eae7e1] text-xs font-semibold text-zinc-700 shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-[#eae7e1] p-4 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tenant by company name, metro city, or type..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : (
        <div className="bg-white rounded-2xl border border-[#eae7e1] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#faf9f6] border-b border-[#eae7e1] text-zinc-500 font-bold">
                  <th className="py-3 px-4">Organization Name</th>
                  <th className="py-3 px-3">Tenant Type</th>
                  <th className="py-3 px-3">Regional Hub</th>
                  <th className="py-3 px-3">Active Users</th>
                  <th className="py-3 px-3">Tenant ID</th>
                  <th className="py-3 px-4 text-right">Provisioned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eae7e1]">
                {filtered.map((org) => (
                  <tr key={org.id} className="hover:bg-[#faf9f6] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-[#181716] flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-zinc-400 shrink-0" />
                        <span>{org.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-800">
                        {org.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-zinc-600">
                      {org.city ? `${org.city}, ${org.country || 'Africa'}` : 'Global Node'}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-zinc-800">
                      {org._count?.users || 1} members
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[10px] text-zinc-400">
                      {org.id}
                    </td>
                    <td className="py-3.5 px-4 text-right text-zinc-500 font-medium">
                      {new Date(org.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
