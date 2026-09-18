export interface DashboardStats {
  businesses: {
    total: number;
    active: number;
    suspended: number;
  };
  applications: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  users: {
    total: number;
    active: number;
  };
  subscriptions: {
    total: number;
    trialing: number;
    active: number;
    expired: number;
    cancelled: number;
    suspended: number;
  };
}

export interface Application {
  id: string;
  businessName: string;
  businessType: string;
  ownerName: string;
  email: string;
  phone?: string;
  requestedPlanId: string;
  trialRequested?: boolean;
  status: 'pending' | 'approved' | 'rejected';
  userId: string;
  tenantId?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  review?: {
    reviewedBy?: string | null;
    reviewedAt?: string | Date | null;
    reason?: string | null;
  };
}

export interface Business {
  id: string;
  businessName: string;
  businessType: string;
  ownerName: string;
  ownerUserId: string;
  planId: string;
  status: 'active' | 'suspended';
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface User {
  id: string;
  email?: string | null;
  displayName?: string | null;
  photoUrl?: string | null;
  emailVerified?: boolean;
  status: 'active' | 'suspended' | 'inactive';
  systemRole: 'admin' | 'user';
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Membership {
  id: string;
  userId: string;
  roleId: string;
  status: 'active' | 'suspended' | 'inactive';
  joinedAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Subscription {
  id: string;
  planId: string;
  tenantId?: string;
  status: 'trialing' | 'active' | 'expired' | 'cancelled' | 'suspended';
  billingCycle?: string;
  startDate?: string | Date;
  trialEndsAt?: string | Date;
  currentPeriodStart?: string | Date;
  currentPeriodEnd?: string | Date;
  externalSubscriptionId?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Plan {
  id: string;
  name: string;
  description?: string;
  price?: {
    monthly: number;
    yearly: number;
    currency: string;
  };
  trial?: {
    enabled: boolean;
    days: number;
  };
  limits?: {
    users?: number;
    menuItems?: number;
    categories?: number;
    tables?: number;
    printers?: number;
    branches?: number;
  };
  features?: Record<string, boolean>;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Feature {
  id: string;
  name: string;
  description?: string;
  category?: string;
  isActive?: boolean;
}
