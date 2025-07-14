# Full-Stack E-commerce Platform

## ✨ Key Features

### Backend (Node.js & Express)

- **Secure User Authentication:** Full registration and login system using JWTs and `bcrypt` for password hashing.
- **RESTful API Design:** A complete set of CRUD endpoints for managing products, users, carts, and orders.
- **Complex Data Modeling:** Mongoose schemas with relationships between Users, Products, Carts, and Orders.
- **Persistent Shopping Cart:** User-specific carts that save between sessions.
- **Product Variants:** Support for adding products with different sizes and colors.
- **Promo Code System:** Business logic to apply discounts to the shopping cart total.
- **Image Uploads:** Handles `multipart/form-data` to allow product images to be uploaded and served.

### Frontend (React)

- **Dynamic UI:** A responsive interface built with React and styled with Tailwind CSS.
- **Client-Side Routing:** Seamless navigation between pages using React Router.
- **Global State Management:** Uses React Context to manage global authentication state across the application.
- **Protected Routes:** Certain pages (like the cart and order history) are only accessible to logged-in users.
- **Full E-commerce Flow:** Users can browse products, search/sort, add items to their cart, apply promo codes, check out, and view their order history.

---

## 🛠️ Tech Stack

- **Frontend:** React, React Router, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT, bcrypt.js
- **File Handling:** Multer
- **Tools:** Git, Postman

---
