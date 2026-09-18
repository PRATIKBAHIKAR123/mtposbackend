import React, { useEffect, useState } from 'react';
import { adminApi } from '../api/admin.api';
import type { Application } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import {
  CheckCircle2,
  XCircle,
  Eye,
  Search,
} from 'lucide-react';

export const Applications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Modals state
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const { showToast } = useToast();

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getApplications(filterStatus);
      setApplications(data);
    } catch (error: any) {
      showToast(error.message || 'Failed to load applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [filterStatus]);

  const handleApprove = async () => {
    if (!selectedApp) return;
    setActionLoading(true);
    try {
      const result = await adminApi.approveApplication(selectedApp.id);
      showToast(`Application approved! Tenant created with ID: ${result.tenantId}`, 'success');
      setIsApproveOpen(false);
      fetchApplications();
    } catch (error: any) {
      showToast(error.response?.data?.message || error.message || 'Failed to approve application', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    setActionLoading(true);
    try {
      await adminApi.rejectApplication(selectedApp.id, rejectReason);
      showToast('Application rejected.', 'info');
      setIsRejectOpen(false);
      setRejectReason('');
      fetchApplications();
    } catch (error: any) {
      showToast(error.response?.data?.message || error.message || 'Failed to reject application', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = applications.filter((app) => {
    const q = search.toLowerCase();
    return (
      app.businessName?.toLowerCase().includes(q) ||
      app.ownerName?.toLowerCase().includes(q) ||
      app.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          {['all', 'pending', 'approved', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                filterStatus === st
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
            placeholder="Search applications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Applications Table */}
      <Card>
        <Table
          loading={loading}
          data={filtered}
          emptyMessage="No applications match the selected filter."
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
              header: 'Applicant',
              accessor: (app) => (
                <div>
                  <p className="text-slate-200 font-medium">{app.ownerName}</p>
                  <p className="text-xs text-slate-400">{app.email}</p>
                  {app.phone && <p className="text-xs text-slate-500">{app.phone}</p>}
                </div>
              ),
            },
            {
              header: 'Plan',
              accessor: (app) => (
                <div>
                  <span className="font-mono text-xs text-indigo-300 uppercase px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                    {app.requestedPlanId}
                  </span>
                  {app.trialRequested && (
                    <span className="block text-[10px] text-emerald-400 mt-1">Trial Requested</span>
                  )}
                </div>
              ),
            },
            {
              header: 'Status',
              accessor: (app) => <Badge status={app.status} />,
            },
            {
              header: 'Actions',
              accessor: (app) => (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    title="View Details"
                    onClick={() => {
                      setSelectedApp(app);
                      setIsDetailOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4 text-slate-300" />
                  </Button>

                  {app.status === 'pending' && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-500 border-emerald-500/30"
                        title="Approve Application"
                        onClick={() => {
                          setSelectedApp(app);
                          setIsApproveOpen(true);
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve</span>
                      </Button>

                      <Button
                        variant="danger"
                        size="sm"
                        title="Reject Application"
                        onClick={() => {
                          setSelectedApp(app);
                          setIsRejectOpen(true);
                        }}
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </Button>
                    </>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Details Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Application Details"
        description={`Application ID: ${selectedApp?.id}`}
        maxWidth="lg"
      >
        {selectedApp && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Business Name</p>
                <p className="text-sm font-bold text-slate-100 mt-0.5">{selectedApp.businessName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Business Type</p>
                <p className="text-sm font-semibold text-slate-200 mt-0.5 capitalize">
                  {selectedApp.businessType}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Owner Name</p>
                <p className="text-sm text-slate-200 mt-0.5">{selectedApp.ownerName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Email</p>
                <p className="text-sm text-slate-200 mt-0.5">{selectedApp.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Requested Plan</p>
                <p className="text-sm font-mono text-indigo-400 mt-0.5 uppercase">
                  {selectedApp.requestedPlanId}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Status</p>
                <div className="mt-0.5">
                  <Badge status={selectedApp.status} />
                </div>
              </div>
            </div>

            {selectedApp.tenantId && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs">
                <span className="font-semibold">Associated Tenant ID: </span>
                <span className="font-mono">{selectedApp.tenantId}</span>
              </div>
            )}

            {selectedApp.review?.reason && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
                <span className="font-semibold">Rejection Reason: </span>
                <span>{selectedApp.review.reason}</span>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Approve Modal */}
      <Modal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        title="Approve Business Application"
        description="This will provision a new tenant business and initialize ownership"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsApproveOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={actionLoading}
              onClick={handleApprove}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              Confirm Approval & Provision
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm text-slate-300">
          <p>
            You are approving the onboarding application for{' '}
            <strong className="text-slate-100">{selectedApp?.businessName}</strong>.
          </p>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
            <p className="text-slate-400">The platform backend will automatically:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
              <li>Create tenant record (<code className="text-indigo-300">tenants/{'{id}'}</code>)</li>
              <li>Seed default POS role templates into the business</li>
              <li>Create owner membership for <strong className="text-slate-200">{selectedApp?.ownerName}</strong></li>
              <li>Provision trial subscription on <strong className="text-indigo-400 uppercase">{selectedApp?.requestedPlanId}</strong></li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        title="Reject Application"
        description="Provide an optional reason for the rejection"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={actionLoading} onClick={handleReject}>
              Reject Application
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-300">
            Rejecting application for <strong className="text-slate-100">{selectedApp?.businessName}</strong>.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Reason (Optional)
            </label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Incomplete business documentation or invalid contact information..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
