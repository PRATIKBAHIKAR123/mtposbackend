import React, { useEffect, useState } from 'react';
import { adminApi } from '../api/admin.api';
import type { Subscription } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { CreditCard, Search, Edit3 } from 'lucide-react';

export const Subscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Modal
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { showToast } = useToast();

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getSubscriptions(statusFilter);
      setSubscriptions(data);
    } catch (error: any) {
      showToast(error.message || 'Failed to load subscriptions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [statusFilter]);

  const handleUpdateStatus = async () => {
    if (!selectedSub || !newStatus) return;
    setActionLoading(true);
    try {
      await adminApi.updateSubscriptionStatus(selectedSub.id, newStatus);
      showToast(`Subscription status updated to ${newStatus}`, 'success');
      setIsModalOpen(false);
      fetchSubscriptions();
    } catch (error: any) {
      showToast(error.message || 'Failed to update subscription status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = subscriptions.filter((s) => {
    const q = search.toLowerCase();
    return s.id?.toLowerCase().includes(q) || s.tenantId?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          {['all', 'trialing', 'active', 'expired', 'cancelled', 'suspended'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
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
            placeholder="Search subscriptions or tenant ID..."
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
          emptyMessage="No subscriptions found."
          columns={[
            {
              header: 'Subscription ID',
              accessor: (s) => (
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-400" />
                  <span className="font-mono text-xs font-medium text-slate-200">{s.id}</span>
                </div>
              ),
            },
            {
              header: 'Tenant ID',
              accessor: (s) => (
                <span className="font-mono text-xs text-slate-400">
                  {s.tenantId || '—'}
                </span>
              ),
            },
            {
              header: 'Plan',
              accessor: (s) => (
                <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                  {s.planId}
                </span>
              ),
            },
            {
              header: 'Status',
              accessor: (s) => <Badge status={s.status} />,
            },
            {
              header: 'Trial Ends At',
              accessor: (s) => (
                <span className="text-xs text-slate-400">
                  {s.trialEndsAt ? new Date(s.trialEndsAt).toLocaleDateString() : '—'}
                </span>
              ),
            },
            {
              header: 'Actions',
              accessor: (s) => (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedSub(s);
                    setNewStatus(s.status);
                    setIsModalOpen(true);
                  }}
                  icon={<Edit3 className="w-3.5 h-3.5" />}
                >
                  Update Status
                </Button>
              ),
            },
          ]}
        />
      </Card>

      {/* Update Status Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Update Subscription Status"
        description={`Subscription: ${selectedSub?.id}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={actionLoading} onClick={handleUpdateStatus}>
              Save Status
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Status
          </label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="trialing">Trialing</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </Modal>
    </div>
  );
};
