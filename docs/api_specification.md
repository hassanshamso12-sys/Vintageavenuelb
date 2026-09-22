# Vintage Avenue REST API Specification

This document details all HTTP REST API endpoints available in the Vintage Avenue E-Commerce & Retail Management System backend.

Base URL: `http://localhost:3000/api`

---

## 1. Authentication (`/api/auth`)

### 1.1 Admin Login
- **HTTP Method**: `POST`
- **Endpoint**: `/api/auth/login`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
- **Response Schema (200 OK)**:
  ```json
  {
    "message": "Login successful",
    "token": "<JWT_TOKEN_STRING>",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@vintageavenue.com"
    }
  }
  ```
- **Response Schema (401 Unauthorized)**:
  ```json
  {
    "error": "Invalid credentials."
  }
  ```

### 1.2 Get Current Admin Info
- **HTTP Method**: `GET`
- **Endpoint**: `/api/auth/me`
- **Auth Required**: Yes (`Authorization: Bearer <token>`)
- **Response Schema (200 OK)**:
  ```json
  {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@vintageavenue.com",
      "created_at": "2026-09-22 16:13:40"
    }
  }
  ```

### 1.3 Logout
- **HTTP Method**: `POST`
- **Endpoint**: `/api/auth/logout`
- **Auth Required**: No

---

## 2. Products (`/api/products`)

### 2.1 List Products
- **HTTP Method**: `GET`
- **Endpoint**: `/api/products`
- **Auth Required**: No
- **Query Parameters**:
  - `category` (string, optional): Filter by category (e.g. `Apparel`, `Timepieces`).
  - `search` (string, optional): Search by product name, description, or SKU.
  - `minPrice` (number, optional): Minimum price threshold.
  - `maxPrice` (number, optional): Maximum price threshold.
  - `era` (string, optional): Filter by era (e.g. `1970s`, `1980s`, `Victorian`).
  - `condition` (string, optional): Filter by condition.
  - `sort` (string, optional): Sort order (`price_asc`, `price_desc`, `name_asc`, `stock_asc`).
- **Response Schema (200 OK)**:
  ```json
  {
    "products": [
      {
        "id": 1,
        "name": "1970s Distressed Biker Leather Jacket",
        "description": "Authentic 1970s vintage dark brown leather jacket.",
        "category": "Apparel",
        "price": 349.99,
        "quantity": 3,
        "sku": "APP-1970-JKT01",
        "era": "1970s",
        "condition": "Mint Vintage",
        "image_url": "https://images.unsplash.com/...",
        "created_at": "2026-09-22 16:13:40",
        "updated_at": "2026-09-22 16:13:40"
      }
    ],
    "count": 1
  }
  ```

### 2.2 Get Product Details
- **HTTP Method**: `GET`
- **Endpoint**: `/api/products/:id`
- **Auth Required**: No
- **Response Schema (200 OK)**:
  ```json
  {
    "product": {
      "id": 1,
      "name": "1970s Distressed Biker Leather Jacket",
      "price": 349.99,
      "quantity": 3,
      "sku": "APP-1970-JKT01"
    }
  }
  ```

### 2.3 Create Product
- **HTTP Method**: `POST`
- **Endpoint**: `/api/products`
- **Auth Required**: Yes (`Authorization: Bearer <token>`)
- **Request Body**:
  ```json
  {
    "name": "1950s Atomic Art Deco Clock",
    "description": "Handcrafted vintage brass desktop clock.",
    "category": "Collectibles",
    "price": 220.00,
    "quantity": 2,
    "sku": "COL-1950-CLK02",
    "era": "1950s",
    "condition": "Excellent",
    "image_url": "https://images.unsplash.com/..."
  }
  ```
- **Response Schema (201 Created)**:
  ```json
  {
    "message": "Product created successfully",
    "product": { "id": 7, "name": "1950s Atomic Art Deco Clock", ... }
  }
  ```

### 2.4 Update Product
- **HTTP Method**: `PUT`
- **Endpoint**: `/api/products/:id`
- **Auth Required**: Yes (`Authorization: Bearer <token>`)
- **Request Body**: Partial or full product fields.
- **Response Schema (200 OK)**: Updated product object.

### 2.5 Delete Product
- **HTTP Method**: `DELETE`
- **Endpoint**: `/api/products/:id`
- **Auth Required**: Yes (`Authorization: Bearer <token>`)
- **Response Schema (200 OK)**:
  ```json
  {
    "message": "Product deleted successfully."
  }
  ```

---

## 3. Customers (`/api/customers`)

### 3.1 List Customers
- **HTTP Method**: `GET`
- **Endpoint**: `/api/customers`
- **Auth Required**: Yes (`Authorization: Bearer <token>`)
- **Query Parameters**: `search`

### 3.2 Get Customer Details & Purchase History
- **HTTP Method**: `GET`
- **Endpoint**: `/api/customers/:id`
- **Auth Required**: Yes (`Authorization: Bearer <token>`)

---

## 4. Orders (`/api/orders`)

### 4.1 List Orders
- **HTTP Method**: `GET`
- **Endpoint**: `/api/orders`
- **Auth Required**: Yes (`Authorization: Bearer <token>`)
- **Query Parameters**: `status` (`Pending`, `Processing`, `Completed`, `Cancelled`), `search`.

### 4.2 Get Order Details & Items
- **HTTP Method**: `GET`
- **Endpoint**: `/api/orders/:id`
- **Auth Required**: No

### 4.3 Create Order (Checkout)
- **HTTP Method**: `POST`
- **Endpoint**: `/api/orders`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "customer": {
      "name": "Eleanor Vance",
      "email": "eleanor@example.com",
      "phone": "+1-555-0192",
      "address": "742 Evergreen Terrace"
    },
    "items": [
      {
        "product_id": 1,
        "quantity": 1
      }
    ]
  }
  ```
- **Business Logic**:
  - Validates item availability against current `Products.quantity`.
  - Atomically decrements product stock.
  - Snapshots current unit price into `OrderItems.unit_price`.
- **Response Schema (201 Created)**:
  ```json
  {
    "message": "Order created successfully",
    "orderId": 2,
    "totalAmount": 349.99
  }
  ```
- **Error Response (400 Bad Request)**:
  ```json
  {
    "error": "Insufficient stock for '1970s Distressed Biker Leather Jacket'. Requested: 5, Available: 3."
  }
  ```

### 4.4 Update Order Status (Soft Cancellation)
- **HTTP Method**: `PATCH`
- **Endpoint**: `/api/orders/:id/status`
- **Auth Required**: Yes (`Authorization: Bearer <token>`)
- **Request Body**:
  ```json
  {
    "status": "Cancelled"
  }
  ```
- **Business Logic**:
  - Soft-cancellation: If transitioning to `Cancelled`, automatically replenishes stock by adding back line-item quantities to `Products.quantity`.

---

## 5. Sales & Analytics (`/api/sales`)

### 5.1 Get KPI Sales Metrics
- **HTTP Method**: `GET`
- **Endpoint**: `/api/sales/metrics`
- **Auth Required**: Yes (`Authorization: Bearer <token>`)
- **Response Schema (200 OK)**:
  ```json
  {
    "todaySales": 349.99,
    "monthlySales": 349.99,
    "totalRevenue": 349.99,
    "totalOrders": 1,
    "productsSold": 1,
    "averageOrderValue": 349.99,
    "lowStockCount": 2
  }
  ```

### 5.2 Get Sales Reports
- **HTTP Method**: `GET`
- **Endpoint**: `/api/sales/reporting`
- **Auth Required**: Yes (`Authorization: Bearer <token>`)
- **Response Schema (200 OK)**: Returns sales aggregated by date, product performance, category performance, and low stock inventory alerts.
