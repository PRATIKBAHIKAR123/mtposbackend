import React from 'react';

interface BadgeProps {
  status: string;
  variant?: 'default' | 'pill';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, variant = 'pill', className = '' }) => {
  const normalized = status?.toLowerCase() || 'default';

  const getColors = () => {
    switch (normalized) {
      case 'active':
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'pending':
      case 'trialing':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'rejected':
      case 'suspended':
      case 'expired':
      case 'cancelled':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'admin':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'inactive':
      case 'user':
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold border transition-colors ${
        variant === 'pill' ? 'rounded-full' : 'rounded-md'
      } ${getColors()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75 animate-pulse" />
      <span className="capitalize">{status}</span>
    </span>
  );
};
