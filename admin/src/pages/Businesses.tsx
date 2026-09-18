import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api/admin.api';
import type { Business } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Table } from '../components/common/Table';
import { useToast } from '../context/ToastContext';
import { Search, Building2, ExternalLink, Power } from 'lucide-react';

export const Businesses: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getBusinesses(statusFilter);
      setBusinesses(data);
    } catch (error: any) {
      showToast(error.message || 'Failed to load businesses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [statusFilter]);

  const toggleStatus = async (biz: Business) => {
    const nextStatus = biz.status === 'active' ? 'suspended' : 'active';
    setActionLoading(biz.id);
    try {
      await adminApi.updateBusinessStatus(biz.id, nextStatus);
      showToast(`Business "${biz.businessName}" is now ${nextStatus}`, 'success');
      fetchBusinesses();
    } catch (error: any) {
      showToast(error.message || 'Failed to update business status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = businesses.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.businessName?.toLowerCase().includes(q) ||
      b.id?.toLowerCase().includes(q) ||
      b.ownerName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          {['all', 'active', 'suspended'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search businesses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <Table
          loading={loading}
          data={filtered}
          emptyMessage="No businesses found."
          onRowClick={(biz) => navigate(`/businesses/${biz.id}`)}
          columns={[
            {
              header: 'Business',
              accessor: (b) => (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100">{b.businessName}</p>
                    <p className="text-xs text-slate-500 font-mono">ID: {b.id}</p>
                  </div>
                </div>
              ),
            },
            {
              header: 'Type',
              accessor: (b) => <span className="capitalize text-slate-300">{b.businessType}</span>,
            },
            {
              header: 'Owner',
              accessor: (b) => (
                <div>
                  <p className="text-slate-200">{b.ownerName || '—'}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{b.ownerUserId}</p>
                </div>
              ),
            },
            {
              header: 'Plan',
              accessor: (b) => (
                <span className="font-mono text-xs text-indigo-300 uppercase px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                  {b.planId || 'standard'}
                </span>
              ),
            },
            {
              header: 'Status',
              accessor: (b) => <Badge status={b.status} />,
            },
            {
              header: 'Actions',
              accessor: (b) => (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant={b.status === 'active' ? 'outline' : 'primary'}
                    size="sm"
                    loading={actionLoading === b.id}
                    onClick={() => toggleStatus(b)}
                    icon={<Power className="w-3.5 h-3.5" />}
                    className={
                      b.status === 'active'
                        ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border-rose-500/30'
                        : 'bg-emerald-600 hover:bg-emerald-500'
                    }
                  >
                    {b.status === 'active' ? 'Suspend' : 'Activate'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/businesses/${b.id}`)}
                    icon={<ExternalLink className="w-3.5 h-3.5 text-slate-400" />}
                  >
                    View
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};
