# ⚡ WalletPerks — Mobile Wallet Loyalty & Customer Retention Platform

> **Turn Every Visitor Into a Lifelong Regular.**  
> WalletPerks is a Next-Gen customer loyalty & re-engagement platform built for coffee shops, boutiques, fitness studios, salons, and local favorite spots.

---

## 🌟 Key Features

* **📱 Digital Mobile Pass Integration**  
  Customers tap or scan a QR code at your store register to access their digital loyalty pass on their mobile browser. Zero mobile app download required!

* **🎯 2-Step Business Registration Onboarding**  
  Dedicated `/register-business` multi-step application flow with interactive industry selection chips (`Coffee & Cafe`, `Retail & Boutique`, `Fitness & Studio`, `Salon & Spa`, `Restaurant & Bar`) and owner security setup.

* **📊 Live Interactive Hero Widget**  
  Real-time analytics dashboard tab preview (`Analytics`, `Digital Pass Card`, `Live Activity`) to demonstrate retention features.

* **🛡️ Fraud-Proof Mobile Scanning & Verification**  
  Encrypted mobile stamp verification to eliminate paper stamp card abuse and boost customer retention by over **32%**.

* **💼 Admin & Merchant Workspace**  
  Separate review queues for super admin approval and business dashboards to issue points, create custom rewards, and track customer engagement metrics.

---

## 🛠️ Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) (App Router architecture)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **UI & Styling:** Vanilla CSS with custom OKLCH color token design system (`app/globals.css`)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Analytics:** `@vercel/analytics`

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have Node.js 18+ and npm installed.

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/universal-rewards-platform.git
cd universal-rewards-platform
npm install
```

### 3. Running Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📁 Project Structure

```
├── app/
│   ├── layout.tsx             # Root layout with site metadata & font configuration
│   ├── page.tsx               # Main landing page route (/)
│   ├── register-business/     # Dedicated business registration route (/register-business)
│   ├── register/              # Alias business registration route (/register)
│   ├── login/                 # Sign-in route (/login)
│   └── globals.css            # Custom design tokens, glassmorphism, & OKLCH styles
├── components/
│   ├── rewards-platform.tsx   # Core WalletPerks application components (Landing, Register, Login, Admin, Dashboard)
│   └── ui/                    # Reusable UI primitives (Button)
├── public/                    # Static assets & icons
└── package.json               # Dependencies & scripts
```

---

## 🔗 Route Map

| Route | Description |
| :--- | :--- |
| `/` | Landing page with interactive hero widget, features, & FAQs |
| `/register-business` | Dedicated multi-step business application onboarding form |
| `/login` | Admin & merchant workspace sign-in portal |

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
