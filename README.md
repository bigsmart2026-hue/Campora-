# Campora — Trusted Campus Marketplace

A campus-based marketplace platform that builds trust through verification, inspection, and reputation — not just user claims.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS (dark mode support) |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Auth | Firebase Authentication (Email/Password + Google) |
| Database | Cloud Firestore |
| Storage | Firebase Cloud Storage |
| Payment | Paystack |
| Icons | Lucide React |
| Notifications | React Hot Toast |

## Features

### Marketplace
- Product listing with images
- Category browsing with icons
- Search, sort (newest, price, popular), and price range filters
- Grid / list view toggle
- Wishlist
- Shopping cart
- Multi-step checkout with Paystack payment

### Trust System
- Student ID verification
- Campus email verification
- Product inspection requests for high-value items
- Trust badges and scores per seller
- Review and rating system

### Delivery
- Runner registration and dashboard
- Real-time delivery tracking with map
- PIN-based delivery confirmation
- GPS tracking

### Roles
- **Buyer** — browse, buy, review
- **Seller** — list products, manage orders, seller dashboard
- **Runner** — accept deliveries, update status, earn
- **Admin** — user management, verification review, disputes, analytics

## Getting Started

### Prerequisites
- Node.js 18+
- Firebase project (Auth, Firestore, Storage enabled)
- Paystack account

### Install

```bash
git clone https://github.com/bigsmart2026-hue/Campora-.git
cd Campora-
npm install
```

### Environment

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

### Run

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── common/        # BackToTop, Breadcrumbs, EmptyState, ErrorBoundary, etc.
│   ├── delivery/      # DeliveryTrackingMap
│   ├── layout/        # Header, Footer, Layout (with MobileBottomNav)
│   ├── product/       # ProductCard
│   └── trust/         # TrustBadges, InspectionRequest
├── hooks/             # useAuth, useProductListData
├── lib/               # Firebase config
├── pages/
│   ├── admin/         # Dashboard, Verifications, Disputes, DeliveryView
│   ├── auth/          # Login, Register
│   ├── delivery/      # DeliveryTracking
│   ├── disputes/      # FileDispute
│   ├── orders/        # OrderDetail, SellerOrderManagement
│   ├── products/      # ProductList, ProductDetail, CreateProduct
│   ├── runners/       # RunnerDashboard, RunnerRegistration, ActiveDelivery
│   └── sellers/       # SellerProfile, SellerDashboard
├── services/          # Firebase CRUD, auth, payment, product services
├── store/             # Zustand stores (auth, cart, theme)
├── types/             # TypeScript interfaces
└── utils/             # Helpers (categoryIcons, format, imageStorage)
```

## Deployment

```bash
# Firebase Hosting
npm run build
firebase deploy --only hosting

# Cloud Functions
cd functions && npm install && npm run build
firebase deploy --only functions
```

## License

Private — All rights reserved.
