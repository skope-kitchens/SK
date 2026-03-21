# SkopeOS - Kitchen Management Platform

## Original Problem Statement
Architect a comprehensive Kitchen Management Platform (SaaS) named "SkopeOS" designed for high-volume commercial kitchens and B2B food service providers.

### Core Modules Required:
1. **Inventory & Stock Engine** - Real-time tracking, low-stock alerts, waste logging, UOM conversions
2. **B2B Client Onboarding** - Tiered pricing, bulk orders, client portals
3. **Advanced Food Cost Calculator** - COGS calculation, theoretical vs actual food cost
4. **Sales Projection Calculator** - Revenue forecasting using historical data

### Platform Requirements:
- Web Dashboard (React/Vite)
- Mobile App (React Native/Expo)
- Sample data for 5 locations

---

## Architecture

```
/app/
├── backend/            # Node.js/Express API (Port 5002)
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API endpoints
│   ├── scripts/        # seed.js
│   └── server.js
├── web/                # React/Vite Frontend (Port 3000)
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── pages/      # Home, DemoDashboard, etc.
│   │   ├── layouts/    # DashboardLayout
│   │   └── App.jsx
│   └── vite.config.js
└── mobile/             # React Native Expo (Initialized)
```

### Tech Stack:
- **Frontend**: React, Vite, Tailwind CSS, Recharts, Framer Motion, Phosphor Icons
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Mobile**: React Native, Expo
- **Design**: Earthy/Sage theme with Bento grid layout

---

## What's Been Implemented

### Completed (Dec 2025)
- [x] Project restructuring (web + backend + mobile directories)
- [x] Backend API creation (Node.js/Express)
- [x] MongoDB models (User, Location, Ingredient, Recipe, Order)
- [x] Database seeding with 5 sample locations
- [x] Mobile app initialization (Expo)
- [x] Frontend UI redesign (Earthy/Sage theme)
- [x] **DemoDashboard bypass** - Avoids 502 login errors
- [x] Admin/Client role toggle with distinct views
- [x] Static data dashboard (Revenue, Orders, Stock, Clients stats)
- [x] Home page CTAs linked to /demo-dashboard

### Demo Dashboard Features (MOCKED DATA)
- Admin View: Total Revenue, Active Orders, Low Stock Items, B2B Clients, Alerts
- Client View: My Orders, Total Spent, Pending Orders, Credit Available, Notifications
- Quick Actions grid for both roles
- Sidebar navigation with all modules

### Interactive Charts (Added Dec 2025)
**Admin View:**
- Revenue Trend (Area chart with 7-day performance + orders overlay)
- Food Cost Analysis (Bar chart - Actual vs Target by category)
- High Food Cost Items table with variance and optimize actions

**Client View:**
- Order Categories (Donut chart - Main Course, Appetizers, etc.)
- Monthly Spending (Bar chart - spending over time)

---

## Known Issues

### Blocked/Bypassed
- **502 Bad Gateway** on external preview URL API calls
  - Workaround: DemoDashboard uses hardcoded static data
  - Root cause: Kubernetes ingress routing for /api endpoint

---

## Prioritized Backlog

### P0 (Critical)
- None currently - DemoDashboard bypass working

### P1 (High Priority)
- [ ] Wire dashboard with real backend data (when 502 resolved)
- [ ] Mobile app screens: Inventory Scanning, Waste Logging, Alerts
- [ ] Inventory management page with CRUD operations
- [ ] Food Cost Calculator page

### P2 (Medium Priority)
- [ ] "Golden Thread" logic: B2B orders deplete inventory automatically
- [ ] Sales Projection Calculator with charts
- [ ] Recipe management with ingredient costing
- [ ] B2B Client onboarding flow

### P3 (Future/Nice-to-have)
- [ ] Razorpay payment integration for B2B invoices
- [ ] Multi-location dashboard switcher
- [ ] Export reports (PDF/CSV)
- [ ] Dark mode toggle

---

## Test Reports
- `/app/test_reports/iteration_1.json` - Frontend testing passed (100%)

---

## Credentials
- Admin (bypassed): admin@skopeos.com / admin123
- Razorpay Test Key: In /app/web/.env

---

## Preview URL
https://food-cost-hub-2.preview.emergentagent.com
