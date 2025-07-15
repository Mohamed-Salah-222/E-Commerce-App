<h1 align="center">
🛍️ Full-Stack E-commerce Platform
</h1>

<p align="center">
A complete, feature-rich e-commerce application built from scratch with a modern MERN stack (MongoDB, Express, React, Node.js) and styled with Tailwind CSS.
</p>

<p align="center">
<strong>Status:</strong> Complete
</p>

✨ Key Features

<table>
<tr>
<td valign="top" width="50%">
<h3>Backend (Node.js & Express)</h3>
<ul>
<li><b>Secure User Authentication:</b> Full registration and login system using JWTs and <code>bcrypt</code> for password hashing.</li>
<li><b>Role-Based Authorization:</b> A system with <code>user</code> and <code>admin</code> roles, protecting critical routes.</li>
<li><b>Full CRUD for Products:</b> Complete API endpoints for product management, protected by admin authorization.</li>
<li><b>User-Specific Shopping Carts:</b> Persistent shopping carts with logic for adding, removing, and updating items with variants (size/color).</li>
<li><b>Promo Code System:</b> Business logic to apply percentage-based discounts to the cart total.</li>
<li><b>Image Uploads:</b> Handles <code>multipart/form-data</code> using <code>multer</code> to store and serve product images.</li>
<li><b>Persistent Order System:</b> A full checkout flow that creates permanent, detailed order records.</li>
</ul>
</td>
<td valign="top" width="50%">
<h3>Frontend (React)</h3>
<ul>
<li><b>Dynamic & Polished UI:</b> A fully responsive interface built with React and styled with Tailwind CSS, featuring a modern design.</li>
<li><b>Client-Side Routing:</b> Seamless navigation between pages using React Router, including protected routes.</li>
<li><b>Global State Management:</b> Uses React Context for authentication and a global notification system.</li>
<li><b>Advanced Search & Sort:</b> Live search and sorting options to filter the product catalog.</li>
<li><b>Full E-commerce Flow:</b> Users can register, log in, browse products, select variants, manage their cart, apply promo codes, check out, and view order history.</li>
<li><b>Toast Notifications:</b> A professional, non-disruptive notification system for user feedback.</li>
</ul>
</td>
</tr>
</table>

🛠️ Tech Stack
Frontend: React, React Router, Tailwind CSS

Backend: Node.js, Express.js

Database: MongoDB

Authentication: JWT, Bcrypt

Tools & Deployment: Git, Postman, Vercel, Render
