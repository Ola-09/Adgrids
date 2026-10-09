import React, { useEffect, useState } from 'react';
import { Calendar, Filter, RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react';
import { TableSkeleton } from '../../shared/LoadingSkeleton';

export const PlatformAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/platform/audit-logs', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || ''}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setLogs(json.logs || []);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#eae7e1]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#181716] tracking-tight">
              Cryptographic Audit Log Viewer
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              Append-Only Ledger
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Immutable log of system events: authentications, campaign renewals, field verifications, booking decisions, and financial disbursements.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-50 border border-[#eae7e1] text-xs font-semibold text-zinc-700 shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Logs Table */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#eae7e1] p-12 text-center text-zinc-500 text-xs">
          No audit log entries recorded yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#eae7e1] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#faf9f6] border-b border-[#eae7e1] text-zinc-500 font-bold">
                  <th className="py-3 px-4">Event Action</th>
                  <th className="py-3 px-3">Actor / Principal</th>
                  <th className="py-3 px-3">Entity Target</th>
                  <th className="py-3 px-3">Entity ID</th>
                  <th className="py-3 px-3">Metadata</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eae7e1]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#faf9f6] transition-colors font-mono">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#181716] font-sans bg-zinc-100 px-2 py-0.5 rounded text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-sans">
                      <div className="font-bold text-zinc-800">{log.actor?.name || 'System / Anonymous'}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{log.actorRole || log.actor?.role}</div>
                    </td>
                    <td className="py-3.5 px-3 font-sans font-semibold text-zinc-700">
                      {log.entity}
                    </td>
                    <td className="py-3.5 px-3 text-zinc-500 text-[11px]">
                      {log.entityId ? log.entityId.slice(0, 14) : '—'}
                    </td>
                    <td className="py-3.5 px-3 text-zinc-500 text-[10px] max-w-xs truncate font-sans">
                      {log.metadata ? (typeof log.metadata === 'string' ? log.metadata : JSON.stringify(log.metadata)) : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right text-zinc-500 text-[11px] font-sans font-medium">
                      {new Date(log.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
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
