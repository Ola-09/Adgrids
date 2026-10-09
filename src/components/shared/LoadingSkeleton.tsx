import React from 'react';

export const KPISkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-[#eae7e1] p-5 shadow-2xs animate-pulse">
    <div className="flex justify-between items-center mb-3">
      <div className="h-3 w-24 bg-zinc-200 rounded" />
      <div className="w-8 h-8 rounded-xl bg-zinc-200" />
    </div>
    <div className="h-8 w-28 bg-zinc-200 rounded mb-2" />
    <div className="h-3 w-36 bg-zinc-100 rounded" />
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="bg-white rounded-2xl border border-[#eae7e1] p-5 shadow-2xs space-y-4 animate-pulse">
    <div className="flex justify-between items-center pb-4 border-b border-[#eae7e1]">
      <div className="h-5 w-40 bg-zinc-200 rounded" />
      <div className="h-8 w-48 bg-zinc-100 rounded" />
    </div>
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="h-10 w-full bg-zinc-100 rounded-xl" />
      ))}
    </div>
  </div>
);
