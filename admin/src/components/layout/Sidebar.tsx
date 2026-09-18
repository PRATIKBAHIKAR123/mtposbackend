import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCheck2,
  Building2,
  Users,
  CreditCard,
  Layers,
  Sparkles,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { adminProfile, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Applications', path: '/applications', icon: FileCheck2 },
    { label: 'Businesses', path: '/businesses', icon: Building2 },
    { label: 'Users', path: '/users', icon: Users },
    { label: 'Subscriptions', path: '/subscriptions', icon: CreditCard },
    { label: 'Plans', path: '/plans', icon: Layers },
    { label: 'Features', path: '/features', icon: Sparkles },
  ];

  return (
    <aside className="w-64 bg-slate-950/90 border-r border-slate-800 flex flex-col shrink-0 h-screen sticky top-0">
      {/* Brand */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-lg">
          M
        </div>
        <div>
          <div className="font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
            <span>POS SaaS</span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Admin
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Platform Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300 shrink-0">
              {adminProfile?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-slate-200 truncate">
                {adminProfile?.displayName || adminProfile?.email || 'System Admin'}
              </p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <ShieldAlert className="w-2.5 h-2.5 inline" />
                Super Admin
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
