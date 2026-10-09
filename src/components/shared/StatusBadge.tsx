import React from 'react';

export type AppStatus =
  | 'Draft'
  | 'Pending'
  | 'Active'
  | 'Live'
  | 'Verified'
  | 'Issue'
  | 'Paused'
  | 'Completed'
  | 'Expired'
  | 'Cancelled'
  | 'Healthy'
  | 'Needs Attention'
  | 'At Risk'
  | 'Critical'
  | string;

interface StatusBadgeProps {
  status: AppStatus;
  size?: 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'sm',
  showDot = true,
  className = '',
}) => {
  const normalized = (status || '').toLowerCase().trim();

  let dotColor = 'bg-zinc-400';
  let textColor = 'text-zinc-700';
  let bgColor = 'bg-zinc-100';

  if (normalized === 'active' || normalized === 'live') {
    dotColor = 'bg-emerald-500';
    textColor = 'text-emerald-800';
    bgColor = 'bg-emerald-50';
  } else if (normalized === 'verified' || normalized === 'healthy') {
    dotColor = 'bg-emerald-600';
    textColor = 'text-emerald-800';
    bgColor = 'bg-emerald-50';
  } else if (normalized === 'pending' || normalized === 'needs attention') {
    dotColor = 'bg-amber-500';
    textColor = 'text-amber-800';
    bgColor = 'bg-amber-50';
  } else if (normalized === 'issue' || normalized === 'at risk' || normalized === 'critical') {
    dotColor = 'bg-rose-500';
    textColor = 'text-rose-800';
    bgColor = 'bg-rose-50';
  } else if (normalized === 'completed') {
    dotColor = 'bg-slate-500';
    textColor = 'text-slate-800';
    bgColor = 'bg-slate-100';
  } else if (normalized === 'expired' || normalized === 'offline') {
    dotColor = 'bg-zinc-800';
    textColor = 'text-zinc-900';
    bgColor = 'bg-zinc-200';
  } else if (normalized === 'paused' || normalized === 'draft') {
    dotColor = 'bg-zinc-400';
    textColor = 'text-zinc-600';
    bgColor = 'bg-zinc-100';
  } else if (normalized === 'cancelled') {
    dotColor = 'bg-red-400';
    textColor = 'text-red-700';
    bgColor = 'bg-red-50';
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-md border border-black/5 ${bgColor} ${textColor} ${padding} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />}
      <span className="capitalize">{status}</span>
    </span>
  );
};
