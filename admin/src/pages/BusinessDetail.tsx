import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../api/admin.api';
import type { Business, Membership, Subscription } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import {
  ArrowLeft,
  CreditCard,
  Users,
  CheckCircle2,
  Power,
  Edit2,
} from 'lucide-react';

export const BusinessDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [business, setBusiness] = useState<Business | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [members, setMembers] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal for editing member role
  const [selectedMember, setSelectedMember] = useState<Membership | null>(null);
  const [newRole, setNewRole] = useState('');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [bizData, subData, memData] = await Promise.allSettled([
        adminApi.getBusinessById(id),
        adminApi.getBusinessSubscription(id),
        adminApi.getBusinessMembers(id),
      ]);

      if (bizData.status === 'fulfilled') setBusiness(bizData.value);
      if (subData.status === 'fulfilled') setSubscription(subData.value);
      if (memData.status === 'fulfilled') setMembers(memData.value);
    } catch (error: any) {
      showToast(error.message || 'Error loading business details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  const handleToggleBusinessStatus = async () => {
    if (!business) return;
    const nextStatus = business.status === 'active' ? 'suspended' : 'active';
    try {
      await adminApi.updateBusinessStatus(business.id, nextStatus);
      showToast(`Business is now ${nextStatus}`, 'success');
      loadDetails();
    } catch (error: any) {
      showToast(error.message || 'Failed to update status', 'error');
    }
  };

  const handleUpdateRole = async () => {
    if (!id || !selectedMember || !newRole) return;
    setActionLoading(true);
    try {
      await adminApi.updateBusinessMemberRole(id, selectedMember.userId, newRole);
      showToast(`Updated member role to ${newRole}`, 'success');
      setIsRoleModalOpen(false);
      loadDetails();
    } catch (error: any) {
      showToast(error.message || 'Failed to update role', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleMemberStatus = async (member: Membership) => {
    if (!id) return;
    const nextStatus = member.status === 'active' ? 'suspended' : 'active';
    try {
      await adminApi.updateBusinessMemberStatus(id, member.userId, nextStatus);
      showToast(`Member status updated to ${nextStatus}`, 'success');
      loadDetails();
    } catch (error: any) {
      showToast(error.message || 'Failed to update member status', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        Loading business data...
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Business not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/businesses')}>
          Back to Businesses
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/businesses')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Businesses
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-100">{business.businessName}</h2>
              <Badge status={business.status} />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Tenant ID: {business.id}</p>
          </div>
        </div>

        <Button
          variant={business.status === 'active' ? 'danger' : 'primary'}
          size="sm"
          onClick={handleToggleBusinessStatus}
          icon={<Power className="w-4 h-4" />}
        >
          {business.status === 'active' ? 'Suspend Business' : 'Activate Business'}
        </Button>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Business Info */}
        <Card title="Business Profile">
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-slate-500 font-medium">Business Type</p>
              <p className="text-slate-200 capitalize mt-0.5">{business.businessType}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Owner</p>
              <p className="text-slate-200 mt-0.5">{business.ownerName || '—'}</p>
              <p className="text-[10px] text-slate-500 font-mono">{business.ownerUserId}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Assigned Plan</p>
              <span className="font-mono text-xs text-indigo-300 uppercase px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                {business.planId}
              </span>
            </div>
          </div>
        </Card>

        {/* Subscription Info */}
        <Card
          title="Active Subscription"
          action={<CreditCard className="w-4 h-4 text-indigo-400" />}
        >
          {subscription ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Status</span>
                <Badge status={subscription.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Billing Cycle</span>
                <span className="text-slate-200 capitalize font-medium">
                  {subscription.billingCycle || 'Monthly'}
                </span>
              </div>
              {subscription.trialEndsAt && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Trial Expiration</span>
                  <span className="text-amber-400 text-xs font-mono">
                    {new Date(subscription.trialEndsAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-500 font-mono">
                  Sub ID: {subscription.id}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-sm">
              No active subscription found.
            </div>
          )}
        </Card>

        {/* Health & Isolation */}
        <Card title="Tenant Isolation">
          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>TenantGuard Enforced</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Dedicated Roles & Permissions</span>
            </div>
            <p className="text-slate-500 pt-2 border-t border-slate-800">
              Only authenticated users with active memberships in this tenant can access its POS data.
            </p>
          </div>
        </Card>
      </div>

      {/* Team Members */}
      <Card
        title="Business Team Members"
        description="Users registered with roles in this business"
        action={
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>{members.length} Members</span>
          </div>
        }
      >
        <Table
          data={members}
          emptyMessage="No team members found for this business."
          columns={[
            {
              header: 'User ID',
              accessor: (m) => <span className="font-mono text-xs text-slate-300">{m.userId}</span>,
            },
            {
              header: 'Role',
              accessor: (m) => (
                <span className="font-mono text-xs uppercase px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200">
                  {m.roleId}
                </span>
              ),
            },
            {
              header: 'Status',
              accessor: (m) => <Badge status={m.status} />,
            },
            {
              header: 'Actions',
              accessor: (m) => (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedMember(m);
                      setNewRole(m.roleId);
                      setIsRoleModalOpen(true);
                    }}
                    icon={<Edit2 className="w-3.5 h-3.5" />}
                  >
                    Change Role
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={
                      m.status === 'active'
                        ? 'text-rose-400 hover:text-rose-300'
                        : 'text-emerald-400 hover:text-emerald-300'
                    }
                    onClick={() => handleToggleMemberStatus(m)}
                  >
                    {m.status === 'active' ? 'Suspend' : 'Activate'}
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Edit Role Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="Update Member Role"
        description={`Modify role for user: ${selectedMember?.userId}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsRoleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={actionLoading} onClick={handleUpdateRole}>
              Save Role
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Select Role
          </label>
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="owner">Owner (Full Permissions)</option>
            <option value="manager">Manager</option>
            <option value="cashier">Cashier</option>
            <option value="waiter">Waiter</option>
            <option value="kitchen">Kitchen Staff</option>
            <option value="accountant">Accountant</option>
          </select>
        </div>
      </Modal>
    </div>
  );
};
