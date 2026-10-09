import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: LucideIcon;
  badge?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  onClick?: () => void;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  badge,
  trend,
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-[#eae7e1] p-5 shadow-2xs transition-all ${
        onClick ? 'cursor-pointer hover:border-[#d9d5ce] hover:shadow-sm' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
        <span>{label}</span>
        <div className="flex items-center gap-2">
          {badge}
          {Icon && (
            <div className="w-8 h-8 rounded-xl bg-[#faf9f6] border border-[#eae7e1] flex items-center justify-center text-[#181716]">
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl lg:text-3xl font-extrabold text-[#181716] tracking-tight tnum">
          {value}
        </div>

        {(subValue || trend) && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={`font-semibold ${
                  trend.isPositive ? 'text-emerald-700' : 'text-zinc-600'
                }`}
              >
                {trend.value}
              </span>
            )}
            {subValue && <span className="text-zinc-500 font-medium">{subValue}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
