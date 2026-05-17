# 🎉 Kongsi - Premium Wholesale Supplies E-Commerce Platform

**A modern, fully-separated customer and admin e-commerce application with premium animations, seamless checkout, and admin dashboard.**

---

## ✨ Key Features

### 🛍️ Customer App
- **Premium Product Catalog**: Browse coffee, tea, and cafe supplies
- **Smart Search & Filters**: Category-based filtering with search
- **Smooth Shopping Experience**: Fully clickable product cards with modal details
- **Smart Cart**: Local storage with real-time sync
- **Enhanced Checkout**: Comprehensive form with validation
- **Order Tracking**: View all previous orders with status
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Premium Animations**: Smooth, elegant transitions throughout
- **Secure Authentication**: Email-based signup/signin

### 👨‍💼 Admin App
- **Protected Dashboard**: Role-based access control
- **Admin Analytics**: Revenue, orders, products, and customer count
- **Secure Login**: Admin-only authentication
- **Modern UI**: Dark premium theme with animations
- **Expandable**: Ready for order management and product administration

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm v9+
- Git
- Supabase account

### Installation

```bash
# Clone/navigate to project
cd "c:\Users\Admin\Desktop\kongsi tea\kongsi-tea"

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Environment Setup

Create `.env.local` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## 📁 Project Structure

```
src/
├── routes/                    # Page routes
│   ├── index.tsx             # Home/landing page
│   ├── menu.tsx              # Product catalog
│   ├── cart.tsx              # Shopping cart
│   ├── checkout.tsx          # Checkout with form
│   ├── orders.tsx            # Order history
│   ├── auth.tsx              # Customer auth
│   ├── admin.tsx             # Admin layout
│   ├── admin.login.tsx       # Admin login
│   └── admin.dashboard.tsx   # Admin stats
├── components/               # Reusable components
│   ├── ProductCard.tsx       # Product display (clickable)
│   ├── ProductPreview.tsx    # Product modal
│   ├── Navbar.tsx            # Navigation header
│   ├── Footer.tsx            # Footer
│   ├── MobileBottomNav.tsx   # Mobile navigation
│   └── ui/                   # UI component library
├── lib/                       # Utilities
│   ├── auth.tsx              # Auth context
│   ├── cart.tsx              # Cart context
│   └── format.ts             # Formatting utilities
└── integrations/             # External services
    └── supabase/             # Supabase configuration
```

---

## 🎨 Design System

### Colors
- **Primary**: Gold gradient (`#D4AF37` series)
- **Background**: Dark with semi-transparent layers
- **Accent**: Amber highlights
- **UI**: Glass-morphism with subtle borders

### Typography
- **Headings**: Playfair Display (serif)
- **Script**: Dancing Script (elegant)
- **Body**: Inter (modern sans-serif)

### Components
- Rounded cards (rounded-2xl)
- Glass effect (glass-morphism)
- Smooth shadows
- Premium animations

---

## 🔐 Authentication

### Customer Flow
1. Sign up with email/password + store details
2. Store data saved to database
3. Automatic login after signup
4. Persistent session

### Admin Flow
1. Existing Supabase user
2. User must have `admin` role in `user_roles` table
3. Login at `/admin/login`
4. Access dashboard

### Create Admin User
```sql
INSERT INTO user_roles (user_id, role)
VALUES ('user-uuid-here', 'admin');
```

---

## 📦 Database Schema

### Required Tables

**user_roles**
```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  role TEXT DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT NOW()
);
```

**stores** (Customer stores)
```sql
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  store_id TEXT UNIQUE,
  store_name TEXT,
  owner_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**products**
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT UNIQUE,
  product_name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  price DECIMAL NOT NULL,
  stock_qty INTEGER,
  unit TEXT,
  category TEXT,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**orders**
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  store_name TEXT,
  customer_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  total_amount DECIMAL,
  order_status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**order_items**
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  product_id TEXT,
  product_name TEXT,
  quantity INTEGER,
  price DECIMAL,
  subtotal DECIMAL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎯 Recent Updates (v1.0.0)

✅ **Brand Rebrand**: BrewHaven → Kongsi
✅ **Admin App**: New protected admin section with login & dashboard
✅ **Product Cards**: Now fully clickable with smooth animations
✅ **Checkout Form**: Complete with validation (phone, email, address)
✅ **Stock Display**: Removed all customer-facing stock numbers
✅ **Animations**: Framer Motion integrated throughout
✅ **Mobile**: Fully responsive with animated bottom nav
✅ **WhatsApp**: Floating button removed

---

## 🚀 Build & Deploy

### Production Build
```bash
npm run build
```

### Deploy to Cloudflare
```bash
npm run build
wrangler deploy
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + TypeScript |
| **Routing** | TanStack Router v1 |
| **Styling** | Tailwind CSS v4 |
| **Animations** | Framer Motion v12 |
| **Backend** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **Build** | Vite |
| **UI Components** | shadcn/ui + Radix |
| **Icons** | Lucide React |
| **Notifications** | Sonner |

---

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

---

## 🎓 Routing Guide

### Customer Routes
| Route | Purpose |
|-------|---------|
| `/` | Home & hero |
| `/menu` | Product catalog with filters |
| `/cart` | Shopping cart |
| `/checkout` | Checkout with form |
| `/orders` | Order history |
| `/auth` | Sign in/up |

### Admin Routes
| Route | Purpose |
|-------|---------|
| `/admin/login` | Admin login |
| `/admin/dashboard` | Stats & overview |

---

## 🐛 Troubleshooting

### Dev server won't start
```bash
# Clear cache and restart
rm -rf .vite .output
npm run dev
```

### Supabase connection issues
1. Verify `.env.local` has correct credentials
2. Check Supabase project is active
3. Confirm authentication is enabled

### Admin login not working
1. Ensure user exists in Supabase Auth
2. Verify `admin` role in `user_roles` table
3. Check browser console for errors

### Missing dependencies
```bash
npm install
```

---

## 📚 Documentation

- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [Setup Guide](./SETUP_GUIDE.md)
- [This README](./README.md)

---

## 🎁 Features Included

- ✅ Fully responsive design
- ✅ Premium animations throughout
- ✅ Complete checkout form
- ✅ Admin authentication
- ✅ Order management
- ✅ Product catalog
- ✅ Shopping cart
- ✅ Order history
- ✅ Mobile bottom navigation
- ✅ Dark premium theme
- ✅ Error handling
- ✅ Loading states
- ✅ Toast notifications
- ✅ Form validation

---

## 🔮 Future Enhancements

- 📧 Email notifications via EmailJS or Supabase Functions
- 🎨 Product image gallery
- 💳 Payment integration (Razorpay/Stripe)
- 📊 Advanced admin analytics
- 📱 Mobile app (React Native)
- 🌐 Multi-language support
- 📈 SEO optimization
- 🔍 Advanced search/filters

---

## 📞 Support

For issues or questions:
1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. Review code comments
3. Check browser console
4. Verify Supabase configuration

---

## 📄 License

This project is proprietary and confidential.

---

## 👏 Credits

Built with modern web technologies and best practices for premium e-commerce experiences.

**Last Updated**: May 15, 2026
**Version**: 1.0.0
**Status**: ✅ Production Ready
