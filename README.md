# ⚡ WalletPerks — Mobile Wallet Loyalty & Customer Retention Platform

> **Turn Every Visitor Into a Lifelong Regular.**  
> WalletPerks is an enterprise customer loyalty & re-engagement platform built for coffee shops, boutiques, fitness studios, salons, and local favorite spots.

---

## 🌟 Key Features

* **📱 Mobile Wallet Digital Pass Integration**  
  Customers tap or scan a QR code at your store register to access their digital loyalty pass on their mobile browser. Zero mobile app download required!

* **📍 Interactive Store Address & Reverse Geocoding**  
  Integrates **TomTom Search & Reverse Geocode API** to provide real-time store address autocomplete and interactive map location pin picking during business onboarding.

* **🎯 2-Step Business Registration Onboarding (`/register-business`)**  
  Multi-step application flow with interactive industry selection chips (`Coffee & Cafe`, `Retail & Boutique`, `Fitness & Studio`, `Salon & Spa`, `Restaurant & Bar`), store address geocoding, and owner credentials setup.

* **📊 Modern Merchant Workspace Portal (`/merchant-dashboard`)**  
  - Left navigation sidebar rail (`Overview`, `Loyalty Rewards`, `Customers`, `Transactions`, `Campaigns`, `Store Settings`).
  - Real-time KPI stat cards (`Total Customers`, `Points Issued`, `Rewards Redeemed`, `Engagement Rate`).
  - Active store rewards management list with pop-over reward publisher modal (`+ Add New Perk`).

* **⏳ Real-Time Application Review & Progress (`/business-status`)**  
  - Real-time status checking via `GET /api/business/status`.
  - Detailed status cards for `Pending Review`, `Approved`, and `Rejected` applications.
  - Prominent rejection callout displaying official rejection reasons recorded by Admin.

* **👑 Enterprise Super Admin Panel (`/admin`)**  
  - **Modular Navigation Rail**:
    - 📋 **Applications Review Queue**: High-density business requests data table with real-time text search, status tabs (`All`, `Pending`, `Approved`, `Rejected`), and clickable column header sorting (`Business Name`, `Owner`, `Industry`, `Submitted Date`, `Status`).
    - 👤 **Users & Role Management**: Enterprise user directory displaying user names, email/phone, assigned roles (`Admin`, `Merchant`, `Customer`), linked store names, and registration timestamps.
  - **Slide-Over Application Inspector Drawer**:
    - Executive hero banner card displaying store initials avatar, business name, legal entity, and live status ribbon.
    - Structured Identity, Store Address, Geocode coordinates (`latitude`, `longitude`), and Description cards.
    - **Official Rejection Reason Dialog Modal** with quick preset chip options (*Incomplete documentation*, *Invalid store address*, *Unsupported category*, *Duplicate registration*).
    - **Application Decision Controls**: High-contrast gradient action buttons for approving, rejecting with reason, and resetting applications to pending review.

---

## 🛠️ Tech Stack & Services

* **Framework:** [Next.js 16](https://nextjs.org/) (App Router architecture)
* **Database & Auth:** [Supabase Postgres](https://supabase.com/) with Row Level Security (RLS) policies
* **Maps & Geocoding:** TomTom Search & Reverse Geocode API (`TOMTOM_API_KEY`)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **UI & Styling:** Tailwind CSS + Vanilla CSS custom OKLCH design system
* **Icons:** [Lucide React](https://lucide.dev/)

---

## 🔗 Route Specs & Architecture

| Primary Route | Alias Routes | Description |
| :--- | :--- | :--- |
| **`/`** | `/home` | Platform landing page with hero widget, features, & FAQs |
| **`/register-business`** | `/register` | 2-step business application onboarding form with TomTom map picker |
| **`/login`** | — | Unified sign-in portal routing users to Admin or Merchant workspace |
| **`/merchant-dashboard`** | `/dashboard` | Verified merchant workspace portal & rewards publisher |
| **`/business-status`** | `/status`, `/merchant`, `/pending-review` | Application progress tracker & rejection reason display |
| **`/admin`** | — | Enterprise admin console (Applications Review Queue & Users Directory) |

---

## 🔌 API Endpoint Specs

### 🏢 Business Operations
* **`POST /api/business/register`**: Submit new merchant business application & create user profile.
* **`GET /api/business/status`**: Retrieve business application status, details, and rejection reason by email/ID.

### 👑 Admin Operations
* **`GET /api/admin/businesses`**: Fetch business applications with status filters, text search, and date sorting.
* **`PATCH /api/admin/businesses`**: Approve application or reject with official rejection reason.
* **`GET /api/admin/users`**: Fetch all platform user profiles with role filters, text search, and linked store mappings.
* **`PATCH /api/admin/users`**: Update user profile role (`admin`, `merchant`, `customer`).

### 🗺️ Geocoding Operations
* **`GET /api/geocode/search?q={query}`**: Address autocomplete & search via TomTom API.
* **`GET /api/geocode/reverse?lat={lat}&lon={lon}`**: Reverse geocode coordinates to full address via TomTom API.

---

## 🗄️ Supabase Database Schema

The database schema is defined in [`supabase/schema.sql`](file:///Users/javiyaraj/Documents/products/wallet_perks/supabase/schema.sql):

* **`public.profiles`**: Stores user accounts (`id`, `email`, `full_name`, `phone`, `role`, `business_id`, `created_at`).
* **`public.businesses`**: Stores business applications (`id`, `owner_id`, `business_name`, `legal_name`, `owner_name`, `email`, `phone`, `industry`, `website`, `address`, `description`, `status`, `rejection_reason`, `latitude`, `longitude`, `created_at`).

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have **Node.js 18+** and **npm** installed.

### 2. Installation & Setup

```bash
# Clone repository
git clone https://github.com/your-username/wallet_perks.git
cd wallet_perks

# Install dependencies
npm install
```

### 3. Environment Variables (`.env.local`)

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# TomTom Geocoding API
TOMTOM_API_KEY=your-tomtom-api-key

# Admin User Account
NEXT_PUBLIC_ADMIN_EMAIL=walletadmin@mailinator.com
```

### 4. Running Locally

Start the Next.js dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
