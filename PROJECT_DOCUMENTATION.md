# POS SaaS Platform — Project Documentation

> Living architecture and project reference document.
>
> This document is intended to be shared with developers, AI coding agents, and other project resources. Any significant architectural change should be reflected here.

---

# 1. Project Overview

This project is a **multi-tenant POS SaaS platform** designed for restaurants and retail stores.

The platform consists of two major applications:

1. **SaaS Admin Panel**
   - Used by the platform / system administrator.
   - Manages business applications, businesses (tenants), users, memberships, plans, subscriptions, platform features, and system settings.

2. **Tenant POS Application**
   - Flutter application used by individual businesses.
   - Handles POS operations, menu management, tables, orders, payments, printing, customers, reports, etc.

## Development Strategy

The project is developed **backend-first** to establish stable API contracts and security rules:

```text
Backend Foundation
        ↓
SaaS Admin APIs
        ↓
SaaS Admin Panel
        ↓
Tenant/POS Backend
        ↓
Flutter Tenant/POS Application
```

---

# 2. Architecture Principles & Core Rules

### Core Rule: Domain-Driven Modularity
**One Domain = One Module / Service.**

- Domain business logic lives inside its dedicated domain module (e.g. `src/users`, `src/tenants`, `src/memberships`, `src/plans`, `src/subscriptions`, `src/applications`).
- `src/system-admin` is strictly an **administrative access & aggregation layer**. It acts as a controller/gateway orchestrating domain services.
- **Never create duplicate domain folders** under `system-admin` (e.g., do NOT create `src/system-admin/users` or `src/system-admin/plans`).

### Security & Authorization Guardrails

1. **Applicant / User Layer**:
   ```text
   Firebase Auth (Bearer Token) → AuthGuard → request.user
   ```
   - Normal users can only access their own resources (e.g., their own user profile or their own submitted application verified by `userId`).

2. **System Admin Layer**:
   ```text
   Firebase Auth (Bearer Token) → AuthGuard → SystemAdminGuard (verifies user.systemRole === 'admin') → SystemAdminController
   ```

3. **Tenant Layer**:
   ```text
   Firebase Auth (Bearer Token) → AuthGuard → TenantGuard (verifies membership in tenant) → Tenant Controllers
   ```
   - **Never trust client-supplied `tenantId`** without verifying the caller's active membership and role in that tenant.

4. **Identity & Data Integrity**:
   - Firestore User Document ID must match the Firebase Auth UID (`users/{uid}`).
   - Passwords must never be stored in Firestore or transmitted unhashed.
   - System roles (`systemRole`) cannot be updated by normal users.

---

# 3. Project Structure

```text
pos-backend/
│
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── config/
│   ├── firebase/
│   │   ├── firebase.service.ts
│   │   └── firebase.module.ts
│   │
│   ├── common/
│   │   ├── decorators/         # @CurrentUser(), @TenantId(), etc.
│   │   ├── guards/             # AuthGuard, TenantGuard, SystemAdminGuard, etc.
│   │   ├── interceptors/
│   │   ├── filters/
│   │   ├── pipes/
│   │   ├── enums/
│   │   ├── interfaces/
│   │   └── utils/
│   │
│   ├── auth/                   # Authentication verification
│   ├── users/                  # User management & profile logic
│   ├── tenants/                # Tenant / Business store logic
│   ├── memberships/            # User-Tenant memberships & roles
│   ├── roles/                  # Role & permissions definitions
│   ├── permissions/            # Feature & permission catalog
│   ├── plans/                  # SaaS pricing & feature plans
│   ├── subscriptions/          # Tenant subscription lifecycle (trial, active, expired)
│   ├── applications/           # Business onboarding application lifecycle
│   │
│   ├── system-admin/           # SaaS Admin API gateway & aggregation
│   │   ├── dto/
│   │   ├── system-admin.controller.ts
│   │   ├── system-admin.service.ts
│   │   ├── system-admin.guard.ts
│   │   └── system-admin.module.ts
│   │
│   ├── menu/                   # (Upcoming) Menu items & categories
│   ├── categories/             # (Upcoming) Item categories
│   ├── tables/                 # (Upcoming) Restaurant dining tables
│   ├── order-types/            # (Upcoming) Dine-in, Takeaway, Delivery
│   ├── order-statuses/         # (Upcoming) Order status pipeline
│   ├── orders/                 # (Upcoming) Order management & lifecycle
│   ├── payments/               # (Upcoming) Payment records & split billing
│   ├── customers/              # (Upcoming) Tenant customer CRM
│   ├── printers/               # (Upcoming) Kitchen & receipt printers
│   ├── tax-rates/              # (Upcoming) Tax calculation engine
│   ├── discounts/              # (Upcoming) Promotions & discount rules
│   ├── reports/                # (Upcoming) Sales, analytics & financial reports
│   ├── audit-logs/             # (Upcoming) Administrative audit trails
│   └── health/                 # Health check & status probe
│
├── test/
├── .env
├── .env.example
├── package.json
└── PROJECT_DOCUMENTATION.md
```

---

# 4. Core Workflows

## 4.1 Business Application & Onboarding Flow

```text
Applicant (Owner)
  │
  ▼
POST /api/v1/applications  (Creates application in 'pending' status)
  │
  ▼
System Admin reviews application (GET /api/v1/system-admin/applications)
  │
  ├── [Approve] (POST /api/v1/system-admin/applications/:id/approve)
  │     ├─ 1. Create Tenant (tenants/{tenantId})
  │     ├─ 2. Create Owner Membership (tenants/{tenantId}/memberships/{userId})
  │     ├─ 3. Seed Default Tenant Roles (tenants/{tenantId}/roles/*)
  │     ├─ 4. Provision Trial Subscription (tenants/{tenantId}/subscriptions/*)
  │     └─ 5. Update Application status = 'approved', tenantId = tenant.id
  │
  └── [Reject] (POST /api/v1/system-admin/applications/:id/reject)
        └─ Update Application status = 'rejected' with reason
```

---

# 5. API Surface Map

## 5.1 Public / Applicant APIs (`/api/v1/applications`)
Protected by `AuthGuard`.

| Method | Endpoint | Description | Guard / Security |
|---|---|---|---|
| `POST` | `/api/v1/applications` | Submit new business application | AuthGuard (binds user.uid) |
| `GET` | `/api/v1/applications/:id` | View applicant's own application | AuthGuard (enforces user ownership) |

## 5.2 System Admin APIs (`/api/v1/system-admin`)
Protected by `AuthGuard` + `SystemAdminGuard`.

| Method | Endpoint | Domain Service Invoked | Description |
|---|---|---|---|
| `GET` | `/api/v1/system-admin/dashboard` | `SystemAdminService` | Aggregate SaaS platform statistics |
| `GET` | `/api/v1/system-admin/applications` | `SystemAdminService` / `ApplicationsService` | List applications (with status filter) |
| `GET` | `/api/v1/system-admin/applications/:id` | `SystemAdminService` / `ApplicationsService` | Get application details |
| `POST` | `/api/v1/system-admin/applications/:id/approve` | `ApplicationsService.approve()` | Approve application & provision tenant |
| `POST` | `/api/v1/system-admin/applications/:id/reject` | `ApplicationsService.reject()` | Reject application with reason |
| `GET` | `/api/v1/system-admin/businesses` | `TenantsService` | List all businesses/tenants |
| `GET` | `/api/v1/system-admin/businesses/:id` | `TenantsService` | Get tenant details |
| `PATCH`| `/api/v1/system-admin/businesses/:id/status` | `TenantsService.updateStatus()` | Update tenant status (`active` / `suspended`) |
| `GET` | `/api/v1/system-admin/users` | `UsersService` | List all system users |
| `GET` | `/api/v1/system-admin/users/:id` | `UsersService` | Get user details |
| `PATCH`| `/api/v1/system-admin/users/:id/status` | `UsersService.updateStatus()` | Update user status |
| `PATCH`| `/api/v1/system-admin/users/:id/system-role` | `UsersService.updateSystemRole()` | Update user system role (`admin` / `user`) |
| `GET` | `/api/v1/system-admin/businesses/:tenantId/subscription` | `SubscriptionsService.getActive()` | Get active subscription for a business |
| `GET` | `/api/v1/system-admin/businesses/:tenantId/members` | `MembershipsService` | List members of a business |
| `GET` | `/api/v1/system-admin/businesses/:tenantId/members/:userId` | `MembershipsService` | Get member details |
| `PATCH`| `/api/v1/system-admin/businesses/:tenantId/members/:userId/role` | `MembershipsService` | Update member role |
| `PATCH`| `/api/v1/system-admin/businesses/:tenantId/members/:userId/status`| `MembershipsService` | Update member status |
| `GET` | `/api/v1/system-admin/subscriptions` | `SubscriptionsService` | List all subscriptions |
| `GET` | `/api/v1/system-admin/subscriptions/:id` | `SubscriptionsService` | Get subscription details |
| `PATCH`| `/api/v1/system-admin/subscriptions/:id/status` | `SubscriptionsService` | Update subscription status |
| `GET` | `/api/v1/system-admin/plans` | `PlansService` | List available subscription plans |
| `GET` | `/api/v1/system-admin/plans/:id` | `PlansService` | Get plan details |
| `POST` | `/api/v1/system-admin/plans` | `PlansService` | Create subscription plan |
| `PATCH`| `/api/v1/system-admin/plans/:id` | `PlansService` | Update subscription plan |
| `GET` | `/api/v1/system-admin/features` | `PermissionsService` | Catalog of SaaS feature flags |

## 5.3 Workspace Onboarding, Subscriptions & Memberships (`/api/v1/*`)
Protected by `AuthGuard` (and `TenantGuard` where tenant-scoped).

| Domain Module | Method | Endpoint | Description | Guard |
|---|---|---|---|---|
| **Tenants** | `GET` | `/api/v1/tenants/my-tenants` | List all businesses authenticated user belongs to | `AuthGuard` |
| | `POST` | `/api/v1/tenants` | Self-serve onboarding: create tenant, roles, owner membership & trial | `AuthGuard` |
| | `GET` | `/api/v1/tenants/:id` | Get restaurant details | `AuthGuard` + `TenantGuard` |
| **Plans** | `GET` | `/api/v1/plans` | Public catalog of subscription plans and tiers | Public |
| | `GET` | `/api/v1/plans/:id` | Plan details | Public |
| **Subscriptions** | `GET` | `/api/v1/subscriptions/active` | Get active subscription & trial days remaining | `AuthGuard` + `TenantGuard` |
| | `POST` | `/api/v1/subscriptions/select-plan` | Upgrade / change subscription plan | `AuthGuard` + `TenantGuard` |
| **Memberships** | `GET` | `/api/v1/memberships` | List restaurant staff team members | `AuthGuard` + `TenantGuard` |
| | `POST` | `/api/v1/memberships` | Add staff member to restaurant | `AuthGuard` + `TenantGuard` |
| | `PATCH`| `/api/v1/memberships/:userId/role` | Update staff member role | `AuthGuard` + `TenantGuard` |
| | `PATCH`| `/api/v1/memberships/:userId/status` | Suspend or activate staff member | `AuthGuard` + `TenantGuard` |
| | `DELETE`| `/api/v1/memberships/:userId` | Remove staff member | `AuthGuard` + `TenantGuard` |

## 5.4 Tenant POS APIs (`/api/v1/*`)
Protected by `AuthGuard` + `TenantGuard` with `x-tenant-id` header or URL parameter.

| Domain Module | Method | Endpoint | Description |
|---|---|---|---|
| **Categories** | `GET` | `/api/v1/categories` | List active menu categories |
| | `POST` | `/api/v1/categories` | Create category |
| | `PATCH`| `/api/v1/categories/:id` | Update category details/sort |
| | `DELETE`| `/api/v1/categories/:id`| Soft-delete category |
| **Menu** | `GET` | `/api/v1/menu` | List menu items (filters: category, availability) |
| | `GET` | `/api/v1/menu/:id` | Item details with variants/addons |
| | `POST` | `/api/v1/menu` | Create menu item |
| | `PATCH`| `/api/v1/menu/:id` | Update item |
| | `PATCH`| `/api/v1/menu/:id/availability` | Cashier fast stock toggle |
| | `DELETE`| `/api/v1/menu/:id` | Soft-delete menu item |
| **Dining Tables** | `GET` | `/api/v1/tables` | List tables with real-time status & orderId |
| | `POST` | `/api/v1/tables` | Add table |
| | `PATCH`| `/api/v1/tables/:id` | Update table info |
| | `PATCH`| `/api/v1/tables/:id/status` | Quick status toggle (`vacant`/`occupied`/`reserved`/`billed`) |
| | `DELETE`| `/api/v1/tables/:id` | Soft-delete table |
| **Customers CRM**| `GET` | `/api/v1/customers` | Search customers by phone/name |
| | `GET` | `/api/v1/customers/:id` | Customer profile, loyalty points, total spend |
| | `POST` | `/api/v1/customers` | Register customer |
| | `PATCH`| `/api/v1/customers/:id` | Update customer profile |
| **Tax Rates** | `GET` | `/api/v1/tax-rates` | List tenant tax rates |
| | `POST` | `/api/v1/tax-rates` | Create tax rate |
| | `PATCH`| `/api/v1/tax-rates/:id` | Update tax rate |
| | `DELETE`| `/api/v1/tax-rates/:id` | Delete tax rate |
| **Discounts** | `GET` | `/api/v1/discounts` | List discounts |
| | `GET` | `/api/v1/discounts/code/:code` | Look up promo code |
| | `POST` | `/api/v1/discounts` | Create discount coupon |
| | `PATCH`| `/api/v1/discounts/:id` | Update discount |
| | `DELETE`| `/api/v1/discounts/:id` | Delete discount |
| **Orders** | `GET` | `/api/v1/orders` | List orders (filters: status, orderType, tableId, paymentStatus) |
| | `GET` | `/api/v1/orders/:id` | Full order details with items |
| | `POST` | `/api/v1/orders` | Place order (auto-calculates, marks table occupied) |
| | `PATCH`| `/api/v1/orders/:id/items` | Add extra rounds of items (KOT) |
| | `PATCH`| `/api/v1/orders/:id/status`| Update workflow status (`placed`→`preparing`→`ready`→`completed`) |
| | `POST` | `/api/v1/orders/:id/cancel`| Cancel order and free dining table |
| **Payments** | `GET` | `/api/v1/payments` | List payments (filter by orderId) |
| | `GET` | `/api/v1/payments/:id` | Get payment receipt |
| | `POST` | `/api/v1/payments` | Process payment (auto-completes order & frees table) |
| **Printers** | `GET` | `/api/v1/printers` | List thermal/network printers |
| | `GET` | `/api/v1/printers/:id` | Get printer config |
| | `POST` | `/api/v1/printers` | Register printer config |
| | `PATCH`| `/api/v1/printers/:id` | Update printer config |
| | `DELETE`| `/api/v1/printers/:id` | Remove printer config |

---

# 6. Step-by-Step Development Roadmap

```text
[BACKEND FOUNDATION & SAAS ADMIN APIS]
Health Check                                      ✅
Firebase & Firestore                              ✅
Auth & Guards                                     ✅
Users Module                                      ✅
Tenants Module                                    ✅
Memberships Module                                ✅
Roles Module                                      ✅
Permissions Module                                ✅
Plans Module                                      ✅
Subscriptions Module                              ✅
Applications Module                               ✅
System Admin Base & Guards                        ✅
STEP 1: System Admin Users Integration            ✅
STEP 2: System Admin Businesses Integration       ✅
STEP 3: System Admin Memberships Integration      ✅
STEP 4: System Admin Subscriptions Integration    ✅
STEP 5: System Admin Plans & Features Integration ✅
STEP 6: System Admin Dashboard Metric Aggregate   ✅
STEP 7: Security Pass & Automated API Testing     ✅
STEP 8: Documentation Sync                        ✅
STEP 9: SaaS Admin Panel (Web Frontend)           ✅
STEP 10: Tenant/POS Backend APIs                  ✅
        (Categories, Menu, Tables, CRM, Taxes,
         Discounts, Orders, Payments, Printers)
        │
        ▼
STEP 11: Flutter Tenant POS App                   [NEXT]
```

---

# 7. Security Matrix & Verification

| Request Scenario | Expected Status |
|---|---|
| Request without Firebase token | `401 Unauthorized` |
| Request with invalid / expired token | `401 Unauthorized` |
| Ordinary authenticated user accessing `/system-admin/*` | `403 Forbidden` |
| Ordinary user accessing another applicant's `/applications/:id` | `403 Forbidden` |
| System Admin accessing `/system-admin/*` | `200 OK` |
| Querying nonexistent user / tenant / application | `404 Not Found` |
| Requesting tenant resources without valid membership | `403 Forbidden` |