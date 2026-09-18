# Flutter POS Application — REST API Integration Manual

This document is the official API reference manual for integrating the **Flutter Restaurant POS App** (Mobile & Tablet) with the **NestJS Multi-Tenant POS Backend**.

---

## 1. Network Configuration & Request Headers

### 1.1 Base URL
In your Flutter app (`lib/core/config/api_config.dart`):
```dart
class ApiConfig {
  // Render Cloud Server:
  static const String baseUrl = 'https://pos-backend-xxxx.onrender.com/api/v1';

  // Local Wi-Fi Testing:
  // static const String baseUrl = 'http://192.168.1.100:3000/api/v1';

  // Android Emulator:
  // static const String baseUrl = 'http://10.0.2.2:3000/api/v1';
}
```

### 1.2 Mandatory Headers for POS Endpoints
Every request to the POS API (except `/health` and `/plans`) **MUST** include:

| Header | Format / Example | Description |
|---|---|---|
| `Content-Type` | `application/json` | Request payload format |
| `Authorization` | `Bearer <Firebase_ID_Token>` | Staff / User JWT token from Firebase Auth |
| `x-tenant-id` | `uuid-or-tenant-id` | Selected Restaurant / Business ID (Required for POS endpoints) |

### 1.3 Firebase Client Configuration for Flutter App
In your Flutter POS app workspace:
- **Android**: Place `google-services.json` in `android/app/google-services.json` (Package: `com.vspayt.pos`).
- **iOS**: Place `GoogleService-Info.plist` in `ios/Runner/GoogleService-Info.plist` (Bundle ID: `com.vspayt.pos`).
- **Flutter Options**: Place `firebase_options.dart` in `lib/firebase_options.dart`.
- **Authentication**: Email/Password authentication is active on project `vspayt`.

---

## 2. API Endpoints Reference

---

### 2.1 System & Health

#### `GET /health`
Probe API status and Firebase connection. No headers required.
- **Response `200 OK`**:
```json
{
  "status": "ok",
  "firebase": "connected",
  "timestamp": "2026-09-18T10:53:06.626Z"
}
```

---

### 2.2 Tenant Onboarding & Business Selection (`/tenants`)

#### `GET /tenants/my-tenants`
**Crucial for POS App Launch**: Returns all restaurant workspaces where the authenticated user is an active member.
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**:
```json
[
  {
    "id": "tenant_123",
    "businessName": "Urban Bistro",
    "businessType": "restaurant",
    "currency": "INR",
    "phone": "+919876543210",
    "status": "active",
    "roleId": "owner",
    "joinedAt": "2026-09-18T10:00:00.000Z"
  }
]
```
> **POS App UX**:
> - If array has multiple businesses → Show **Restaurant Switcher** dialog.
> - If array has 1 business → Auto-select and store in `flutter_secure_storage`.
> - If array is empty → Route user to **Create Restaurant / Onboard Workspace** screen.

#### `POST /tenants`
**Self-Serve Restaurant Onboarding**:
Creates a new tenant workspace, seeds default restaurant roles (`owner`, `manager`, `cashier`, `waiter`), assigns the current user as Owner, and provisions a 14-day free trial on the selected plan.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "businessName": "Urban Bistro",
  "businessType": "restaurant",
  "ownerName": "John Doe",
  "phone": "+919876543210",
  "currency": "INR",
  "planId": "growth",
  "trialRequested": true
}
```
- **Response `201 Created`**:
```json
{
  "tenant": {
    "id": "tenant_123",
    "businessName": "Urban Bistro",
    "businessType": "restaurant",
    "currency": "INR",
    "status": "active",
    "createdAt": "2026-09-18T12:00:00.000Z"
  },
  "membership": {
    "id": "user_uid_1",
    "userId": "user_uid_1",
    "roleId": "owner",
    "status": "active"
  },
  "subscription": {
    "id": "sub_456",
    "planId": "growth",
    "status": "trialing",
    "trialEndsAt": "2026-10-02T12:00:00.000Z"
  }
}
```

#### `GET /tenants/:id`
Get full tenant business profile.
- **Headers**: `Authorization: Bearer <token>`, `x-tenant-id: <tenantId>`

---

### 2.3 Plans & Subscriptions (`/plans`, `/subscriptions`)

#### `GET /plans`
Publicly available catalog of subscription tiers and pricing for plan selection UI.
- **Headers**: None required
- **Response `200 OK`**:
```json
[
  {
    "id": "starter",
    "name": "Starter Plan",
    "price": 999,
    "currency": "INR",
    "billingCycle": "monthly",
    "trial": { "enabled": true, "days": 14 },
    "limits": { "maxUsers": 3, "maxTables": 10 }
  },
  {
    "id": "growth",
    "name": "Growth Plan",
    "price": 2499,
    "currency": "INR",
    "billingCycle": "monthly",
    "trial": { "enabled": true, "days": 14 },
    "limits": { "maxUsers": 10, "maxTables": 50 }
  }
]
```

#### `GET /subscriptions/active`
Get the active subscription details and trial status for the current restaurant.
- **Headers**: `Authorization: Bearer <token>`, `x-tenant-id: <tenantId>`
- **Response `200 OK`**:
```json
{
  "id": "sub_456",
  "planId": "growth",
  "status": "trialing",
  "startDate": "2026-09-18T12:00:00.000Z",
  "trialEndsAt": "2026-10-02T12:00:00.000Z",
  "currentPeriodEnd": "2026-10-02T12:00:00.000Z",
  "plan": {
    "id": "growth",
    "name": "Growth Plan",
    "price": 2499
  }
}
```

#### `POST /subscriptions/select-plan`
Change or upgrade subscription plan for the current restaurant.
- **Headers**: `Authorization: Bearer <token>`, `x-tenant-id: <tenantId>`
- **Request Body**:
```json
{
  "planId": "growth",
  "billingCycle": "monthly"
}
```

---

### 2.4 Staff & Team Memberships (`/memberships`)

#### `GET /memberships`
List all staff members for the current restaurant.
- **Headers**: `Authorization: Bearer <token>`, `x-tenant-id: <tenantId>`
- **Query (Optional)**: `?status=active`
- **Response `200 OK`**:
```json
[
  {
    "id": "staff_uid_1",
    "userId": "staff_uid_1",
    "roleId": "manager",
    "status": "active",
    "joinedAt": "2026-09-18T10:00:00.000Z"
  }
]
```

#### `POST /memberships`
Add a staff member by their Firebase User UID and role.
- **Request Body**:
```json
{
  "userId": "staff_uid_2",
  "roleId": "cashier"
}
```

#### `PATCH /memberships/:userId/role`
Update staff role (`manager`, `cashier`, `waiter`).

#### `PATCH /memberships/:userId/status`
Suspend or re-activate staff member (`status: "active" | "suspended" | "inactive"`).

#### `DELETE /memberships/:userId`
Remove staff member from the restaurant.

---

### 2.5 Categories (`/categories`)

#### `GET /categories`
List all active menu categories sorted by display order.
- **Response `200 OK`**:
```json
[
  {
    "id": "cat_101",
    "tenantId": "tenant_1",
    "name": "Starters & Appetizers",
    "description": "Crispy starters and snacks",
    "icon": "utensils",
    "sortOrder": 1,
    "isActive": true,
    "createdAt": "2026-09-18T10:00:00.000Z",
    "updatedAt": "2026-09-18T10:00:00.000Z"
  }
]
```

#### `POST /categories`
Create a new category.
- **Request Body**:
```json
{
  "name": "Beverages & Mocktails",
  "description": "Chilled drinks and shakes",
  "icon": "coffee",
  "sortOrder": 2,
  "isActive": true
}
```

#### `PATCH /categories/:id`
Update an existing category.

#### `DELETE /categories/:id`
Soft-delete category.

---

### 2.3 Menu Catalog (`/menu`)

#### `GET /menu`
List all menu items for the tenant.
- **Query Parameters (Optional)**:
  - `categoryId`: Filter items by category (e.g. `?categoryId=cat_101`)
  - `isAvailable`: Filter by stock status (`?isAvailable=true`)
- **Response `200 OK`**:
```json
[
  {
    "id": "menu_201",
    "tenantId": "tenant_1",
    "categoryId": "cat_101",
    "name": "Paneer Tikka",
    "description": "Charcoal grilled cottage cheese cubes with spices",
    "price": 240.0,
    "costPrice": 110.0,
    "imageUrl": "https://example.com/paneer.jpg",
    "taxRateId": "tax_1",
    "sku": "APP-PAN-01",
    "isAvailable": true,
    "variants": [
      { "name": "Half (4 pcs)", "price": 140.0 },
      { "name": "Full (8 pcs)", "price": 240.0 }
    ],
    "modifiers": [
      { "name": "Extra Mint Chutney", "price": 20.0 },
      { "name": "Extra Spicy", "price": 0.0 }
    ],
    "sortOrder": 1,
    "createdAt": "2026-09-18T10:00:00.000Z",
    "updatedAt": "2026-09-18T10:00:00.000Z"
  }
]
```

#### `GET /menu/:id`
Get single menu item details.

#### `POST /menu`
Add a new menu item.
- **Request Body**:
```json
{
  "categoryId": "cat_101",
  "name": "Butter Chicken",
  "description": "Tender chicken cooked in rich makhani gravy",
  "price": 340.0,
  "costPrice": 160.0,
  "imageUrl": "https://example.com/chicken.jpg",
  "sku": "MAIN-CHI-01",
  "isAvailable": true,
  "variants": [
    { "name": "Half", "price": 220.0 },
    { "name": "Full", "price": 340.0 }
  ],
  "modifiers": [
    { "name": "Extra Butter", "price": 30.0 }
  ],
  "sortOrder": 2
}
```

#### `PATCH /menu/:id/availability`
**Instant Out-of-Stock Toggle** for cashier/waiter:
- **Request Body**:
```json
{
  "isAvailable": false
}
```

---

### 2.4 Dining Tables (`/tables`)

#### `GET /tables`
List all dining tables with real-time occupancy status.
- **Query Parameters (Optional)**:
  - `section`: Filter by section (`?section=Terrace`, `?section=Main`, `?section=Bar`)
  - `status`: Filter by status (`?status=vacant`, `?status=occupied`, `?status=billed`, `?status=reserved`)
- **Response `200 OK`**:
```json
[
  {
    "id": "tbl_01",
    "tenantId": "tenant_1",
    "name": "T1",
    "section": "Main Hall",
    "capacity": 4,
    "status": "vacant",
    "currentOrderId": null,
    "isActive": true,
    "createdAt": "2026-09-18T10:00:00.000Z",
    "updatedAt": "2026-09-18T10:00:00.000Z"
  },
  {
    "id": "tbl_02",
    "tenantId": "tenant_1",
    "name": "T2",
    "section": "Terrace",
    "capacity": 6,
    "status": "occupied",
    "currentOrderId": "ord_1001",
    "isActive": true,
    "createdAt": "2026-09-18T10:00:00.000Z",
    "updatedAt": "2026-09-18T10:30:00.000Z"
  }
]
```

#### `POST /tables`
Add a new table.
- **Request Body**:
```json
{
  "name": "T3",
  "section": "Terrace",
  "capacity": 4,
  "status": "vacant"
}
```

#### `PATCH /tables/:id/status`
Manual status toggle:
- **Request Body**:
```json
{
  "status": "reserved"
}
```

---

### 2.5 Customers & Loyalty CRM (`/customers`)

#### `GET /customers`
Search customers by phone number or name.
- **Query Parameters**:
  - `search`: Phone or Name query (`?search=9876543210`)
- **Response `200 OK`**:
```json
[
  {
    "id": "cust_501",
    "tenantId": "tenant_1",
    "name": "Rahul Sharma",
    "phone": "9876543210",
    "email": "rahul@example.com",
    "notes": "Regular guest, prefers less spicy food",
    "loyaltyPoints": 140,
    "totalSpent": 3400.0,
    "visitCount": 7,
    "lastVisitAt": "2026-09-15T19:30:00.000Z",
    "isActive": true
  }
]
```

#### `POST /customers`
Register a new customer at counter:
- **Request Body**:
```json
{
  "name": "Pooja Patel",
  "phone": "9123456789",
  "email": "pooja@example.com",
  "notes": "Table near window requested"
}
```

---

### 2.6 Tax Rates & Discounts (`/tax-rates`, `/discounts`)

#### `GET /tax-rates`
List configured tax rates (e.g. GST 5%):
- **Response `200 OK`**:
```json
[
  {
    "id": "tax_01",
    "name": "GST (Restaurant)",
    "percentage": 5.0,
    "isInclusive": false,
    "isActive": true
  }
]
```

#### `GET /discounts/code/:code`
Validate promo code entered by cashier:
- **Example**: `GET /discounts/code/WELCOME10`
- **Response `200 OK`**:
```json
{
  "id": "disc_01",
  "name": "Welcome Discount",
  "type": "percentage",
  "value": 10.0,
  "code": "WELCOME10",
  "minOrderAmount": 300.0,
  "isActive": true
}
```

---

### 2.7 Core POS Orders Engine (`/orders`)

#### `POST /orders`
**Place and fire an order**. Automatically:
- Calculates item subtotals (`quantity * unitPrice`)
- Applies discount coupon / amount
- Computes tax total
- If `orderType == 'dine-in'`, automatically updates table status to `occupied` and links `currentOrderId`.

- **Request Body**:
```json
{
  "orderType": "dine-in",
  "tableId": "tbl_01",
  "customerId": "cust_501",
  "items": [
    {
      "menuItemId": "menu_201",
      "name": "Paneer Tikka",
      "quantity": 2,
      "unitPrice": 240.0,
      "selectedVariant": "Full",
      "modifiers": ["Extra Mint Chutney"],
      "notes": "Make it crispy"
    },
    {
      "menuItemId": "menu_202",
      "name": "Cold Drink (Coke)",
      "quantity": 2,
      "unitPrice": 50.0
    }
  ],
  "discountCode": "WELCOME10",
  "taxRate": 5.0,
  "notes": "Customer requested fast serving"
}
```

- **Response `201 Created`**:
```json
{
  "id": "ord_1001",
  "orderNumber": "#84201",
  "tenantId": "tenant_1",
  "orderType": "dine-in",
  "tableId": "tbl_01",
  "tableName": "T1",
  "customerId": "cust_501",
  "customerName": "Rahul Sharma",
  "status": "placed",
  "paymentStatus": "unpaid",
  "items": [
    {
      "menuItemId": "menu_201",
      "name": "Paneer Tikka",
      "quantity": 2,
      "unitPrice": 240.0,
      "selectedVariant": "Full",
      "modifiers": ["Extra Mint Chutney"],
      "notes": "Make it crispy",
      "subtotal": 480.0
    },
    {
      "menuItemId": "menu_202",
      "name": "Cold Drink (Coke)",
      "quantity": 2,
      "unitPrice": 50.0,
      "subtotal": 100.0
    }
  ],
  "subtotal": 580.0,
  "discountTotal": 58.0,
  "discountCode": "WELCOME10",
  "taxTotal": 26.10,
  "taxRatePercentage": 5.0,
  "grandTotal": 548.10,
  "paidAmount": 0.0,
  "notes": "Customer requested fast serving",
  "createdAt": "2026-09-18T10:45:00.000Z",
  "updatedAt": "2026-09-18T10:45:00.000Z"
}
```

#### `GET /orders`
List orders with real-time filters.
- **Query Parameters**:
  - `status`: `placed` | `preparing` | `ready` | `completed` | `cancelled`
  - `orderType`: `dine-in` | `takeaway` | `delivery`
  - `tableId`: View active orders for a specific table
  - `paymentStatus`: `unpaid` | `partially_paid` | `paid`

#### `GET /orders/:id`
Get full order details by ID.

#### `PATCH /orders/:id/items`
**Add items to an existing order (KOT Round 2 / Extra Items)**:
- Appends new items, recalculates subtotals, taxes, and grand total.
- **Request Body**:
```json
{
  "items": [
    {
      "menuItemId": "menu_301",
      "name": "Gulab Jamun",
      "quantity": 2,
      "unitPrice": 80.0
    }
  ]
}
```

#### `PATCH /orders/:id/status`
Advance order workflow:
- **Request Body**:
```json
{
  "status": "preparing"
}
```
*(Options: `placed` → `preparing` → `ready` → `completed`)*

#### `POST /orders/:id/cancel`
Cancel an order. Automatically frees the dining table back to `vacant`.

---

### 2.8 Billing & Payments (`/payments`)

#### `POST /payments`
**Process Payment & Settle Bill**:
- Accepts `cash`, `card`, `upi`, or `split`.
- **Automatic Settlement Logic**:
  1. Once total paid reaches or exceeds `grandTotal`:
     - Order `paymentStatus` becomes `paid`.
     - Order `status` advances to `completed`.
     - Associated dining table is automatically set to `vacant` (`currentOrderId = null`).
     - Customer CRM spend and loyalty points are recorded automatically.
  2. If payment is partial: order becomes `partially_paid`.

- **Request Body**:
```json
{
  "orderId": "ord_1001",
  "amount": 548.10,
  "method": "upi",
  "transactionRef": "UPI-TXN-987654321",
  "notes": "Settled via Google Pay at Counter 1"
}
```

- **Response `201 Created`**:
```json
{
  "payment": {
    "id": "pay_901",
    "tenantId": "tenant_1",
    "orderId": "ord_1001",
    "amount": 548.10,
    "method": "upi",
    "transactionRef": "UPI-TXN-987654321",
    "status": "success",
    "cashierUserId": "staff_uid_1",
    "cashierName": "Sam Cashier",
    "createdAt": "2026-09-18T11:15:00.000Z"
  },
  "order": {
    "id": "ord_1001",
    "status": "completed",
    "paymentStatus": "paid",
    "paidAmount": 548.10,
    "completedAt": "2026-09-18T11:15:00.000Z"
  }
}
```

---

### 2.9 Hardware Printers (`/printers`)

#### `GET /printers`
List configured printers for the restaurant:
- **Query Parameters**:
  - `type`: `kot` | `receipt` | `bar`
- **Response `200 OK`**:
```json
[
  {
    "id": "prn_01",
    "name": "Main Kitchen KOT",
    "type": "kot",
    "connectionType": "network",
    "ipAddress": "192.168.1.200",
    "port": 9100,
    "paperWidth": 80,
    "isDefault": true,
    "isActive": true
  },
  {
    "id": "prn_02",
    "name": "Front Desk Billing",
    "type": "receipt",
    "connectionType": "usb",
    "paperWidth": 80,
    "isDefault": false,
    "isActive": true
  }
]
```

---

## 3. Ready-to-Use Dart Models for Flutter

Save these in `lib/data/models/`:

### 3.1 `MenuItemModel`
```dart
class MenuItemModel {
  final String id;
  final String categoryId;
  final String name;
  final String? description;
  final double price;
  final String? imageUrl;
  final bool isAvailable;
  final List<dynamic>? variants;
  final List<dynamic>? modifiers;

  MenuItemModel({
    required this.id,
    required this.categoryId,
    required this.name,
    this.description,
    required this.price,
    this.imageUrl,
    required this.isAvailable,
    this.variants,
    this.modifiers,
  });

  factory MenuItemModel.fromJson(Map<String, dynamic> json) => MenuItemModel(
        id: json['id'] ?? '',
        categoryId: json['categoryId'] ?? '',
        name: json['name'] ?? '',
        description: json['description'],
        price: (json['price'] as num?)?.toDouble() ?? 0.0,
        imageUrl: json['imageUrl'],
        isAvailable: json['isAvailable'] ?? true,
        variants: json['variants'],
        modifiers: json['modifiers'],
      );
}
```

### 3.2 `TableModel`
```dart
class TableModel {
  final String id;
  final String name;
  final String section;
  final int capacity;
  final String status; // vacant, occupied, reserved, billed
  final String? currentOrderId;

  TableModel({
    required this.id,
    required this.name,
    required this.section,
    required this.capacity,
    required this.status,
    this.currentOrderId,
  });

  factory TableModel.fromJson(Map<String, dynamic> json) => TableModel(
        id: json['id'] ?? '',
        name: json['name'] ?? '',
        section: json['section'] ?? 'Main',
        capacity: json['capacity'] ?? 4,
        status: json['status'] ?? 'vacant',
        currentOrderId: json['currentOrderId'],
      );
}
```

### 3.3 `OrderModel`
```dart
class OrderModel {
  final String id;
  final String orderNumber;
  final String orderType;
  final String? tableId;
  final String? tableName;
  final String status;
  final String paymentStatus;
  final double subtotal;
  final double taxTotal;
  final double discountTotal;
  final double grandTotal;
  final double paidAmount;
  final List<dynamic> items;

  OrderModel({
    required this.id,
    required this.orderNumber,
    required this.orderType,
    this.tableId,
    this.tableName,
    required this.status,
    required this.paymentStatus,
    required this.subtotal,
    required this.taxTotal,
    required this.discountTotal,
    required this.grandTotal,
    required this.paidAmount,
    required this.items,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) => OrderModel(
        id: json['id'] ?? '',
        orderNumber: json['orderNumber'] ?? '',
        orderType: json['orderType'] ?? 'dine-in',
        tableId: json['tableId'],
        tableName: json['tableName'],
        status: json['status'] ?? 'placed',
        paymentStatus: json['paymentStatus'] ?? 'unpaid',
        subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0.0,
        taxTotal: (json['taxTotal'] as num?)?.toDouble() ?? 0.0,
        discountTotal: (json['discountTotal'] as num?)?.toDouble() ?? 0.0,
        grandTotal: (json['grandTotal'] as num?)?.toDouble() ?? 0.0,
        paidAmount: (json['paidAmount'] as num?)?.toDouble() ?? 0.0,
        items: json['items'] ?? [],
      );
}
```
