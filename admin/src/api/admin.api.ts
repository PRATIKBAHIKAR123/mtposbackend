import { apiClient } from './client';
import type {
  Application,
  Business,
  DashboardStats,
  Feature,
  Membership,
  Plan,
  Subscription,
  User,
} from '../types';

export const adminApi = {
  // Current user info
  getMe: async (): Promise<User> => {
    const res = await apiClient.get('/users/me');
    return res.data;
  },

  // Dashboard
  getDashboard: async (): Promise<DashboardStats> => {
    const res = await apiClient.get('/system-admin/dashboard');
    return res.data;
  },

  // Applications
  getApplications: async (status?: string): Promise<Application[]> => {
    const res = await apiClient.get('/system-admin/applications', {
      params: status && status !== 'all' ? { status } : undefined,
    });
    return res.data;
  },

  getApplicationById: async (id: string): Promise<Application> => {
    const res = await apiClient.get(`/system-admin/applications/${id}`);
    return res.data;
  },

  approveApplication: async (id: string): Promise<{ success: boolean; tenantId: string }> => {
    const res = await apiClient.post(`/system-admin/applications/${id}/approve`);
    return res.data;
  },

  rejectApplication: async (id: string, reason?: string): Promise<{ success: boolean }> => {
    const res = await apiClient.post(`/system-admin/applications/${id}/reject`, { reason });
    return res.data;
  },

  // Businesses (Tenants)
  getBusinesses: async (status?: string): Promise<Business[]> => {
    const res = await apiClient.get('/system-admin/businesses', {
      params: status && status !== 'all' ? { status } : undefined,
    });
    return res.data;
  },

  getBusinessById: async (id: string): Promise<Business> => {
    const res = await apiClient.get(`/system-admin/businesses/${id}`);
    return res.data;
  },

  updateBusinessStatus: async (id: string, status: 'active' | 'suspended'): Promise<Business> => {
    const res = await apiClient.patch(`/system-admin/businesses/${id}/status`, { status });
    return res.data;
  },

  getBusinessSubscription: async (tenantId: string): Promise<Subscription> => {
    const res = await apiClient.get(`/system-admin/businesses/${tenantId}/subscription`);
    return res.data;
  },

  // Memberships
  getBusinessMembers: async (tenantId: string, status?: string): Promise<Membership[]> => {
    const res = await apiClient.get(`/system-admin/businesses/${tenantId}/members`, {
      params: status ? { status } : undefined,
    });
    return res.data;
  },

  getBusinessMember: async (tenantId: string, userId: string): Promise<Membership> => {
    const res = await apiClient.get(`/system-admin/businesses/${tenantId}/members/${userId}`);
    return res.data;
  },

  updateBusinessMemberRole: async (tenantId: string, userId: string, roleId: string): Promise<Membership> => {
    const res = await apiClient.patch(`/system-admin/businesses/${tenantId}/members/${userId}/role`, { roleId });
    return res.data;
  },

  updateBusinessMemberStatus: async (tenantId: string, userId: string, status: string): Promise<Membership> => {
    const res = await apiClient.patch(`/system-admin/businesses/${tenantId}/members/${userId}/status`, { status });
    return res.data;
  },

  // Users
  getUsers: async (status?: string, systemRole?: string): Promise<User[]> => {
    const params: Record<string, string> = {};
    if (status && status !== 'all') params.status = status;
    if (systemRole && systemRole !== 'all') params.systemRole = systemRole;
    const res = await apiClient.get('/system-admin/users', { params });
    return res.data;
  },

  getUserById: async (id: string): Promise<User> => {
    const res = await apiClient.get(`/system-admin/users/${id}`);
    return res.data;
  },

  updateUserStatus: async (id: string, status: 'active' | 'suspended' | 'inactive'): Promise<User> => {
    const res = await apiClient.patch(`/system-admin/users/${id}/status`, { status });
    return res.data;
  },

  updateUserSystemRole: async (id: string, systemRole: 'admin' | 'user'): Promise<User> => {
    const res = await apiClient.patch(`/system-admin/users/${id}/system-role`, { systemRole });
    return res.data;
  },

  // Subscriptions
  getSubscriptions: async (status?: string): Promise<Subscription[]> => {
    const res = await apiClient.get('/system-admin/subscriptions', {
      params: status && status !== 'all' ? { status } : undefined,
    });
    return res.data;
  },

  getSubscriptionById: async (id: string): Promise<Subscription> => {
    const res = await apiClient.get(`/system-admin/subscriptions/${id}`);
    return res.data;
  },

  updateSubscriptionStatus: async (id: string, status: string): Promise<Subscription> => {
    const res = await apiClient.patch(`/system-admin/subscriptions/${id}/status`, { status });
    return res.data;
  },

  // Plans
  getPlans: async (includeInactive = true): Promise<Plan[]> => {
    const res = await apiClient.get('/system-admin/plans', {
      params: { includeInactive: String(includeInactive) },
    });
    return res.data;
  },

  getPlanById: async (id: string): Promise<Plan> => {
    const res = await apiClient.get(`/system-admin/plans/${id}`);
    return res.data;
  },

  createPlan: async (data: Partial<Plan>): Promise<Plan> => {
    const res = await apiClient.post('/system-admin/plans', data);
    return res.data;
  },

  updatePlan: async (id: string, data: Partial<Plan>): Promise<Plan> => {
    const res = await apiClient.patch(`/system-admin/plans/${id}`, data);
    return res.data;
  },

  // Features
  getFeatures: async (): Promise<Feature[]> => {
    const res = await apiClient.get('/system-admin/features');
    return res.data;
  },
};
