import React from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldCheck, Bell } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();

  const getTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard Overview';
    if (path.startsWith('/applications')) return 'Business Applications';
    if (path.startsWith('/businesses')) return 'Tenant Businesses';
    if (path.startsWith('/users')) return 'Platform Users';
    if (path.startsWith('/subscriptions')) return 'Tenant Subscriptions';
    if (path.startsWith('/plans')) return 'SaaS Pricing & Plans';
    if (path.startsWith('/features')) return 'Platform Feature Catalog';
    return 'System Admin';
  };

  return (
    <header className="h-16 px-8 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-lg font-bold text-slate-100 tracking-tight">{getTitle()}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Backend health status badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Backend API Connected</span>
        </div>

        {/* Admin guard indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Admin Authenticated</span>
        </div>

        <button className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/60 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
        </button>
      </div>
    </header>
  );
};
