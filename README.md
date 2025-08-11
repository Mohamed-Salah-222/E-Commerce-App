🛍️ Full-Stack E-commerce Platform
A complete, feature-rich e-commerce application built with React.js and Node.js/Express, featuring modern UI components, secure backend APIs, and comprehensive shopping functionality.
Status: ✅ Complete
Live Demo: 🌐 Click here to try it out

✨ Features
🎨 Frontend (React.js)

🔐 Secure User Authentication – Registration, login, password recovery, and Google OAuth.
🛡 Role-Based Access Control – User & admin dashboards with protected routes and role-specific features.
🛒 Dynamic Product Catalog – Advanced search, filtering, and detailed product pages.
🛍 Shopping Cart Management – Add/remove items, adjust quantities, and see real-time price updates.
💳 Checkout & Payment Processing – Secure payment flow with integrated payment gateway.
📱 Responsive Design – Optimized for desktop, tablet, and mobile.

⚙️ Backend (Node.js / Express)

⚙ RESTful API Architecture – Clean, modular, and scalable API endpoints for products, users, orders, and authentication.
🔐 JWT Authentication & Authorization – Protects routes and enforces role-based access.
🗄 MongoDB Database – Stores products, orders, and user data with Mongoose ODM.
📦 Order & Inventory Management – Updates stock levels in real-time when orders are placed.
📧 Email Services – Account verification and password reset using email.
🛠 Admin Functionality – Create, update, and delete products; manage orders and users.
💳 Payment Integration – Secure server-side payment gateway handling.

🎯 User Experience

🔄 Seamless Navigation – Client-side routing with React Router.
⚡ Real-time Updates – Live cart, order status notifications, and inventory updates.
🌐 Social Login Integration – Google OAuth for quick signup/login.
👤 Profile Management – Update personal information & account settings.
🔒 Protected Routes – Secure access for users & admins.

🛠 Tech Stack
LayerTechnologiesFrontendReact.js, React Router, JSXBackendNode.js, Express.js, MongoDB, MongooseAuthenticationJWT, Google OAuth, Email VerificationState ManagementReact Context API, HooksUI / StylingTailwind CSSPaymentIntegrated Payment GatewayToolsGit, npm, Vercel (Frontend), Render (Backend)

📁 Component Structure
The application is built with 19+ reusable React components and a structured backend, including:

User Management – Registration, Login, Profile, Password Recovery
Shopping Experience – Product Catalog, Cart, Checkout, Order History
Admin Dashboard – Product, Order, & User Management
Authentication – Protected Routes, Email Verification, OAuth Callbacks
UI Components – Notifications, Payment Modals, Product Cards
Backend Modules – Auth Middleware, Product Controller, Order Controller, Payment Handler

💳 Test Payments (Stripe)
This project uses Stripe for secure payment processing.
You can test the checkout flow using Stripe's test mode — no real money will be charged.
Test Card Details (for testing only):
Card NumberExpiration DateCVCZIP Code4242 4242 4242 4242Any future dateAny 3 digitsAny ZIP
Steps to test payment:

Add items to your cart.
Go to checkout.
Enter the test card details above.
Use any valid billing info (it's ignored in test mode).
Complete the payment — the order will process as if it was successful.

Note: Stripe provides other test card numbers for different scenarios like failed payments, authentication, etc.

<div align="center">
🚀 Ready to explore the full-stack e-commerce experience!
</div>
