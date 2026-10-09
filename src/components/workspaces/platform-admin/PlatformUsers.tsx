import React, { useEffect, useState } from 'react';
import { Lock, Mail, RefreshCw, Search, ShieldCheck, UserCheck, Users } from 'lucide-react';
import { TableSkeleton } from '../../shared/LoadingSkeleton';
import { StatusBadge } from '../../shared/StatusBadge';

export const PlatformUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter !== 'ALL') params.append('role', roleFilter);

      const res = await fetch(`/api/platform/users?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || ''}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setUsers(json.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#eae7e1]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#181716] tracking-tight">
              User Identity & Access Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-bold text-xs">
              {users.length} Users
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Role assignments, multi-factor authentication statuses, email verification compliance, and account activity.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-50 border border-[#eae7e1] text-xs font-semibold text-zinc-700 shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl border border-[#eae7e1] p-4 shadow-2xs flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user name or corporate email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs text-[#181716] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ef5a24]"
          />
        </form>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-[#eae7e1] bg-[#faf9f6] text-xs font-semibold text-zinc-800"
        >
          <option value="ALL">All Roles</option>
          <option value="Agency Admin">Agency Admin</option>
          <option value="Campaign Manager">Campaign Manager</option>
          <option value="Customer / Client Company">Customer / Client</option>
          <option value="Media Owner">Media Owner</option>
          <option value="Vendor">Vendor</option>
          <option value="Field Agent">Field Agent</option>
          <option value="Platform Admin">Platform Admin</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#eae7e1] p-12 text-center text-zinc-500 text-xs">
          No user accounts found matching your query.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#eae7e1] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#faf9f6] border-b border-[#eae7e1] text-zinc-500 font-bold">
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-3">Role Privilege</th>
                  <th className="py-3 px-3">Organization</th>
                  <th className="py-3 px-3">Account Status</th>
                  <th className="py-3 px-3">MFA Security</th>
                  <th className="py-3 px-3">Email Verified</th>
                  <th className="py-3 px-4 text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eae7e1]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#faf9f6] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-[#181716]">{u.name}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-800">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-zinc-700">
                      {u.tenant?.name || 'ADGRID Core'}
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="py-3.5 px-3">
                      {u.mfaEnabled ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <Lock className="w-3 h-3 text-emerald-600" />
                          <span>Enabled</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-zinc-400">Off</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      {u.emailVerifiedAt ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <UserCheck className="w-3 h-3 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-800 font-medium">Pending</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right text-zinc-500 font-medium">
                      {new Date(u.createdAt).toLocaleDateString()}
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
