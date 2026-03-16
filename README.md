# E-Commerce Platform

A full-stack e-commerce application built with the MERN stack. Supports user authentication, product browsing, cart management, Stripe payments, order tracking, and admin dashboard.

## Tech Stack

**Frontend:** React, React Router, Tailwind CSS  
**Backend:** Node.js, Express.js  
**Database:** MongoDB (Mongoose ODM)  
**Payments:** Stripe (PaymentIntent API)  
**Auth:** JWT, Passport.js (Google OAuth 2.0)  
**Storage:** Cloudinary (image uploads)  
**Email:** Nodemailer (Gmail SMTP)

## Features

### Customer
- Email/password registration with 6-digit email verification
- Google OAuth login
- Password reset via tokenized email links
- Product browsing with search and sort (price, newest)
- Product variants (sizes and colors)
- Persistent server-side cart with promo code support
- Stripe checkout with real-time payment status
- Order history with status tracking

### Admin
- Product management (create, edit, delete) with Cloudinary image uploads
- Order management with status updates (processing, shipped, delivered, cancelled)
- User management with role promotion

## Project Structure

```
Front-End/src/
  components/
    layout/      Navbar, AuthLayout, PageLoader, Skeleton
    ui/          FormInput, FormAlert, SubmitButton, Notification
    auth/        Login, Register, Verify, ForgotPassword, ResetPassword
    products/    HomePage, ProductList, ProductCard, ProductDetailPage
    cart/        CartPage, CheckoutPage, PaymentPopup
    orders/      OrderHistoryPage
    profile/     UserProfilePage
    admin/       AdminOrdersPage, AdminProductsPage, AdminUsersPage
  context/       AuthContext, NotificationContext

Back-End/
  config/        Passport Google OAuth setup
  controllers/   Auth, Cart, Order, Product, User, Admin, Payment
  middleware/     JWT auth, admin validation, cart provisioning, validators
  models/        User, Product, Cart, Order
  routes/        Route definitions
  services/      Email service (verification, password reset)
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Stripe account
- Cloudinary account
- Google Cloud Console project (for OAuth)

### Environment Variables

**Backend (.env)**
```
PORT=3000
MONGODB_URI=
JWT_SECRET=
STRIPE_SECRET_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
GMAIL_APP_PASSWORD=
FRONTEND_URL=
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:3000
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_ADMIN_EMAIL=
VITE_ADMIN_PASSWORD=
VITE_TEST_USER_EMAIL=
VITE_TEST_USER_PASSWORD=
```

### Installation

```bash
# Backend
cd Back-End
npm install
npm start

# Frontend
cd Front-End
npm install
npm run dev
```

## API Overview

| Route Group | Base Path | Auth | Description |
|------------|-----------|------|-------------|
| Auth | /api/auth | Mixed | Register, login, verify, password reset, Google OAuth |
| Products | /api/products | Public | Browse and search products |
| Cart | /api/cart | JWT | Cart CRUD and promo codes |
| Orders | /api/orders | JWT | Create and view orders |
| Payments | /api | JWT | Stripe payment intent and confirmation |
| Admin | /api/admin | JWT + Admin | Product, order, and user management |

## Key Technical Decisions

- **Server-side payment calculation:** Cart totals are computed from the database, never trusted from the frontend, preventing amount tampering.
- **Self-invalidating reset tokens:** Password reset JWTs are signed with the current password hash, so changing the password automatically invalidates unused tokens.
- **Database-validated admin access:** Admin status is checked via DB lookup per request rather than JWT claims, ensuring immediate effect when roles change.
- **Immediate JWT rendering:** On page load, the user is set from the decoded JWT instantly while fresh data loads in the background, eliminating cold-start blank screens.
- **Feature-based architecture:** Components organized by domain (auth, cart, admin) rather than type for better discoverability and co-location.
