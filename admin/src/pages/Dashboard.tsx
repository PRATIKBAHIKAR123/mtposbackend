import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api/admin.api';
import type { Application, DashboardStats } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Table } from '../components/common/Table';
import {
  Building2,
  FileCheck2,
  Users,
  CreditCard,
  ArrowUpRight,
  AlertTriangle,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsData, appsData] = await Promise.all([
          adminApi.getDashboard(),
          adminApi.getApplications(),
        ]);
        setStats(statsData);
        setRecentApplications(appsData.slice(0, 5));
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const statCards = [
    {
      title: 'Businesses (Tenants)',
      value: stats?.businesses.total ?? 0,
      sub: `${stats?.businesses.active ?? 0} active • ${stats?.businesses.suspended ?? 0} suspended`,
      icon: Building2,
      color: 'from-blue-500/20 to-indigo-500/20 text-indigo-400 border-indigo-500/30',
      link: '/businesses',
    },
    {
      title: 'Onboarding Applications',
      value: stats?.applications.total ?? 0,
      sub: `${stats?.applications.pending ?? 0} pending review`,
      icon: FileCheck2,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
      link: '/applications',
      highlight: (stats?.applications.pending ?? 0) > 0,
    },
    {
      title: 'Platform Users',
      value: stats?.users.total ?? 0,
      sub: `${stats?.users.active ?? 0} active users`,
      icon: Users,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
      link: '/users',
    },
    {
      title: 'Subscriptions',
      value: stats?.subscriptions.total ?? 0,
      sub: `${stats?.subscriptions.trialing ?? 0} trialing • ${stats?.subscriptions.active ?? 0} active`,
      icon: CreditCard,
      color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
      link: '/subscriptions',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Platform Control Center</h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time SaaS platform metrics, tenant lifecycles, and system controls.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/plans')}
            icon={<Layers className="w-4 h-4" />}
          >
            Manage Plans
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/applications?status=pending')}
            icon={<FileCheck2 className="w-4 h-4" />}
          >
            Review Applications
          </Button>
        </div>
      </div>

      {/* Pending Applications Alert Banner */}
      {(stats?.applications.pending ?? 0) > 0 && (
        <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Action Required: Pending Onboarding</p>
              <p className="text-xs text-amber-300/80">
                There are {stats?.applications.pending} business applications awaiting approval.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold border-amber-400/30"
            onClick={() => navigate('/applications?status=pending')}
          >
            Review Now
          </Button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(card.link)}
              className={`p-6 rounded-2xl bg-slate-900/80 border transition-all duration-200 hover:scale-[1.02] cursor-pointer relative overflow-hidden group ${
                card.highlight ? 'border-amber-500/40' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {card.title}
                  </p>
                  <h3 className="text-3xl font-extrabold text-slate-100 mt-2 tracking-tight">
                    {loading ? '—' : card.value}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 font-medium">{card.sub}</p>
                </div>
                <div className={`p-3 rounded-xl border bg-gradient-to-br ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 group-hover:text-indigo-400 transition-colors">
                <span>View details</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Applications Section */}
      <Card
        title="Recent Onboarding Applications"
        description="Latest businesses that applied to join the POS SaaS platform"
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/applications')}
            className="text-xs text-indigo-400"
          >
            View all
          </Button>
        }
      >
        <Table
          loading={loading}
          data={recentApplications}
          emptyMessage="No onboarding applications submitted yet."
          onRowClick={() => navigate(`/applications`)}
          columns={[
            {
              header: 'Business',
              accessor: (app) => (
                <div>
                  <p className="font-semibold text-slate-100">{app.businessName}</p>
                  <p className="text-xs text-slate-400 capitalize">{app.businessType}</p>
                </div>
              ),
            },
            {
              header: 'Owner',
              accessor: (app) => (
                <div>
                  <p className="text-slate-200">{app.ownerName}</p>
                  <p className="text-xs text-slate-500">{app.email}</p>
                </div>
              ),
            },
            {
              header: 'Requested Plan',
              accessor: (app) => (
                <span className="font-mono text-xs text-indigo-300 uppercase px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                  {app.requestedPlanId}
                </span>
              ),
            },
            {
              header: 'Status',
              accessor: (app) => <Badge status={app.status} />,
            },
            {
              header: 'Action',
              accessor: () => (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/applications');
                  }}
                >
                  Review
                </Button>
              ),
            },
          ]}
        />
      </Card>

      {/* Platform Features & Systems Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Quick Actions" description="Fast administrative management operations">
          <div className="grid grid-cols-2 gap-3 mt-2">
            <button
              onClick={() => navigate('/plans')}
              className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-800/40 text-left transition-colors flex items-center gap-3"
            >
              <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">SaaS Plans</p>
                <p className="text-xs text-slate-500">Edit pricing & limits</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/features')}
              className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-800/40 text-left transition-colors flex items-center gap-3"
            >
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">Feature Catalog</p>
                <p className="text-xs text-slate-500">View SaaS modules</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/businesses')}
              className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-800/40 text-left transition-colors flex items-center gap-3"
            >
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">Tenants</p>
                <p className="text-xs text-slate-500">Suspend or activate</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/users')}
              className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-800/40 text-left transition-colors flex items-center gap-3"
            >
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">Admin Roles</p>
                <p className="text-xs text-slate-500">Manage permissions</p>
              </div>
            </button>
          </div>
        </Card>

        <Card title="Platform Architecture Status" description="Multi-tenant backend synchronization">
          <div className="space-y-3 mt-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-slate-200">Firestore Cloud Database</span>
              </div>
              <span className="text-xs font-mono text-emerald-400">Connected</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-slate-200">System Admin Guard Engine</span>
              </div>
              <span className="text-xs font-mono text-emerald-400">Active</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-slate-200">Tenant Isolation & Guard</span>
              </div>
              <span className="text-xs font-mono text-emerald-400">Enforced</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
