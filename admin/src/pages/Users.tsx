import React, { useEffect, useState } from 'react';
import { adminApi } from '../api/admin.api';
import type { User } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { Search, ShieldAlert, ShieldCheck } from 'lucide-react';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Promote/Demote Modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { showToast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers(statusFilter, roleFilter);
      setUsers(data);
    } catch (error: any) {
      showToast(error.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [statusFilter, roleFilter]);

  const toggleStatus = async (user: User) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await adminApi.updateUserStatus(user.id, nextStatus);
      showToast(`User status updated to ${nextStatus}`, 'success');
      fetchUsers();
    } catch (error: any) {
      showToast(error.message || 'Failed to update user status', 'error');
    }
  };

  const handleSystemRoleChange = async () => {
    if (!selectedUser) return;
    const nextRole = selectedUser.systemRole === 'admin' ? 'user' : 'admin';
    setActionLoading(true);
    try {
      await adminApi.updateUserSystemRole(selectedUser.id, nextRole);
      showToast(`User role updated to ${nextRole}`, 'success');
      setIsRoleModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      showToast(error.message || 'Failed to update user role', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.displayName?.toLowerCase().includes(q) ||
      u.id?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-500 px-2 font-medium">Status:</span>
          {['all', 'active', 'suspended'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
          <div className="h-4 w-px bg-slate-800 mx-1" />
          <span className="text-xs text-slate-500 px-2 font-medium">Role:</span>
          {['all', 'admin', 'user'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                roleFilter === r
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <Table
          loading={loading}
          data={filtered}
          emptyMessage="No users found."
          columns={[
            {
              header: 'User',
              accessor: (u) => (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                    {u.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100">{u.displayName || u.email}</p>
                    <p className="text-xs text-slate-500 font-mono">UID: {u.id}</p>
                  </div>
                </div>
              ),
            },
            {
              header: 'Email',
              accessor: (u) => <span className="text-slate-300">{u.email || '—'}</span>,
            },
            {
              header: 'System Role',
              accessor: (u) => <Badge status={u.systemRole} />,
            },
            {
              header: 'Status',
              accessor: (u) => <Badge status={u.status} />,
            },
            {
              header: 'Actions',
              accessor: (u) => (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(u);
                      setIsRoleModalOpen(true);
                    }}
                    icon={
                      u.systemRole === 'admin' ? (
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                      )
                    }
                  >
                    {u.systemRole === 'admin' ? 'Demote' : 'Promote Admin'}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleStatus(u)}
                    className={
                      u.status === 'active'
                        ? 'text-rose-400 hover:text-rose-300'
                        : 'text-emerald-400 hover:text-emerald-300'
                    }
                  >
                    {u.status === 'active' ? 'Suspend' : 'Activate'}
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Role Change Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title={
          selectedUser?.systemRole === 'admin'
            ? 'Demote from System Administrator'
            : 'Promote to System Administrator'
        }
        description={`User: ${selectedUser?.email || selectedUser?.id}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsRoleModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={selectedUser?.systemRole === 'admin' ? 'danger' : 'primary'}
              loading={actionLoading}
              onClick={handleSystemRoleChange}
            >
              Confirm Change
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm text-slate-300">
          {selectedUser?.systemRole === 'admin' ? (
            <p className="text-rose-300">
              Are you sure you want to revoke System Administrator privileges for this user? They will
              no longer be able to access the admin portal.
            </p>
          ) : (
            <p className="text-slate-300">
              Granting System Administrator privileges gives this user full platform-level access,
              including business approval, role management, and plan creation.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};
