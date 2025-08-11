<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E-commerce Platform README</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            line-height: 1.6;
            color: #24292f;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15);
            margin: 20px 0;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 30px;
            border-bottom: 3px solid #667eea;
        }
        
        h1 {
            font-size: 2.8em;
            margin-bottom: 15px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .subtitle {
            font-size: 1.2em;
            color: #586069;
            margin-bottom: 25px;
        }
        
        .status-demo {
            display: flex;
            justify-content: center;
            gap: 30px;
            flex-wrap: wrap;
            margin-top: 20px;
        }
        
        .badge {
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: bold;
            text-decoration: none;
            transition: transform 0.2s;
        }
        
        .badge:hover {
            transform: translateY(-2px);
        }
        
        .status {
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
        }
        
        .demo {
            background: linear-gradient(135deg, #007bff, #0056b3);
            color: white;
        }
        
        h2 {
            color: #0366d6;
            font-size: 1.8em;
            margin-top: 40px;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e1e4e8;
        }
        
        h3 {
            color: #6f42c1;
            font-size: 1.4em;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            margin: 20px 0;
        }
        
        .feature-card {
            background: linear-gradient(135deg, #f8f9ff, #e8f0ff);
            padding: 25px;
            border-radius: 15px;
            border-left: 5px solid #667eea;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }
        
        .feature-card h3 {
            margin-top: 0;
            color: #667eea;
        }
        
        ul {
            padding-left: 0;
        }
        
        li {
            list-style: none;
            padding: 8px 0;
            position: relative;
            padding-left: 30px;
        }
        
        li:before {
            content: "✨";
            position: absolute;
            left: 0;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }
        
        th, td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #e1e4e8;
        }
        
        th {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            font-weight: bold;
        }
        
        tr:nth-child(even) {
            background-color: #f8f9ff;
        }
        
        tr:hover {
            background-color: #e8f0ff;
            transition: background-color 0.2s;
        }
        
        .tech-stack {
            background: linear-gradient(135deg, #f1f8ff, #e6f3ff);
            padding: 30px;
            border-radius: 15px;
            margin: 20px 0;
        }
        
        .component-list {
            background: linear-gradient(135deg, #fff5f5, #ffe6e6);
            padding: 25px;
            border-radius: 15px;
            margin: 20px 0;
        }
        
        .component-list ul {
            columns: 2;
            column-gap: 30px;
        }
        
        .test-payment {
            background: linear-gradient(135deg, #f0fff4, #e6ffed);
            padding: 30px;
            border-radius: 15px;
            border: 2px solid #28a745;
            margin: 20px 0;
        }
        
        .test-card {
            background: #2d3748;
            color: #e2e8f0;
            padding: 20px;
            border-radius: 10px;
            font-family: 'Courier New', monospace;
            margin: 15px 0;
        }
        
        .steps {
            counter-reset: step-counter;
        }
        
        .steps li {
            counter-increment: step-counter;
            padding-left: 40px;
        }
        
        .steps li:before {
            content: counter(step-counter);
            background: #667eea;
            color: white;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            left: 0;
            font-weight: bold;
            font-size: 0.9em;
        }
        
        .note {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
        
        .note strong {
            color: #856404;
        }
        
        .footer {
            text-align: center;
            margin-top: 50px;
            padding: 30px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border-radius: 15px;
            font-size: 1.2em;
            font-weight: bold;
        }
        
        @media (max-width: 768px) {
            .status-demo {
                flex-direction: column;
                align-items: center;
            }
            
            .component-list ul {
                columns: 1;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛍️ Full-Stack E-commerce Platform</h1>
            <p class="subtitle">A complete, feature-rich e-commerce application built with React.js and Node.js/Express, featuring modern UI components, secure backend APIs, and comprehensive shopping functionality.</p>
            
            <div class="status-demo">
                <span class="badge status">✅ Status: Complete</span>
                <a href="#" class="badge demo">🌐 Live Demo: Click here to try it out</a>
            </div>
        </div>

        <h2>✨ Features</h2>

        <div class="features-grid">
            <div class="feature-card">
                <h3>🎨 Frontend (React.js)</h3>
                <ul>
                    <li><strong>🔐 Secure User Authentication</strong> – Registration, login, password recovery, and Google OAuth.</li>
                    <li><strong>🛡 Role-Based Access Control</strong> – User & admin dashboards with protected routes and role-specific features.</li>
                    <li><strong>🛒 Dynamic Product Catalog</strong> – Advanced search, filtering, and detailed product pages.</li>
                    <li><strong>🛍 Shopping Cart Management</strong> – Add/remove items, adjust quantities, and see real-time price updates.</li>
                    <li><strong>💳 Checkout & Payment Processing</strong> – Secure payment flow with integrated payment gateway.</li>
                    <li><strong>📱 Responsive Design</strong> – Optimized for desktop, tablet, and mobile.</li>
                </ul>
            </div>

            <div class="feature-card">
                <h3>⚙️ Backend (Node.js / Express)</h3>
                <ul>
                    <li><strong>⚙ RESTful API Architecture</strong> – Clean, modular, and scalable API endpoints for products, users, orders, and authentication.</li>
                    <li><strong>🔐 JWT Authentication & Authorization</strong> – Protects routes and enforces role-based access.</li>
                    <li><strong>🗄 MongoDB Database</strong> – Stores products, orders, and user data with Mongoose ODM.</li>
                    <li><strong>📦 Order & Inventory Management</strong> – Updates stock levels in real-time when orders are placed.</li>
                    <li><strong>📧 Email Services</strong> – Account verification and password reset using email.</li>
                    <li><strong>🛠 Admin Functionality</strong> – Create, update, and delete products; manage orders and users.</li>
                    <li><strong>💳 Payment Integration</strong> – Secure server-side payment gateway handling.</li>
                </ul>
            </div>

            <div class="feature-card">
                <h3>🎯 User Experience</h3>
                <ul>
                    <li><strong>🔄 Seamless Navigation</strong> – Client-side routing with React Router.</li>
                    <li><strong>⚡ Real-time Updates</strong> – Live cart, order status notifications, and inventory updates.</li>
                    <li><strong>🌐 Social Login Integration</strong> – Google OAuth for quick signup/login.</li>
                    <li><strong>👤 Profile Management</strong> – Update personal information & account settings.</li>
                    <li><strong>🔒 Protected Routes</strong> – Secure access for users & admins.</li>
                </ul>
            </div>
        </div>

        <div class="tech-stack">
            <h2>🛠 Tech Stack</h2>
            <table>
                <thead>
                    <tr>
                        <th>Layer</th>
                        <th>Technologies</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Frontend</strong></td>
                        <td>React.js, React Router, JSX</td>
                    </tr>
                    <tr>
                        <td><strong>Backend</strong></td>
                        <td>Node.js, Express.js, MongoDB, Mongoose</td>
                    </tr>
                    <tr>
                        <td><strong>Authentication</strong></td>
                        <td>JWT, Google OAuth, Email Verification</td>
                    </tr>
                    <tr>
                        <td><strong>State Management</strong></td>
                        <td>React Context API, Hooks</td>
                    </tr>
                    <tr>
                        <td><strong>UI / Styling</strong></td>
                        <td>Tailwind CSS</td>
                    </tr>
                    <tr>
                        <td><strong>Payment</strong></td>
                        <td>Integrated Payment Gateway</td>
                    </tr>
                    <tr>
                        <td><strong>Tools</strong></td>
                        <td>Git, npm, Vercel (Frontend), Render (Backend)</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="component-list">
            <h2>📁 Component Structure</h2>
            <p>The application is built with <strong>19+ reusable React components</strong> and a structured backend, including:</p>
            <ul>
                <li><strong>User Management</strong> – Registration, Login, Profile, Password Recovery</li>
                <li><strong>Shopping Experience</strong> – Product Catalog, Cart, Checkout, Order History</li>
                <li><strong>Admin Dashboard</strong> – Product, Order, & User Management</li>
                <li><strong>Authentication</strong> – Protected Routes, Email Verification, OAuth Callbacks</li>
                <li><strong>UI Components</strong> – Notifications, Payment Modals, Product Cards</li>
                <li><strong>Backend Modules</strong> – Auth Middleware, Product Controller, Order Controller, Payment Handler</li>
            </ul>
        </div>

        <div class="test-payment">
            <h2>💳 Test Payments (Stripe)</h2>
            <p>This project uses <strong>Stripe</strong> for secure payment processing.<br>
            You can test the checkout flow using Stripe's test mode — <strong>no real money will be charged</strong>.</p>

            <h3>Test Card Details (for testing only):</h3>
            <table>
                <thead>
                    <tr>
                        <th>Card Number</th>
                        <th>Expiration Date</th>
                        <th>CVC</th>
                        <th>ZIP Code</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>4242 4242 4242 4242</code></td>
                        <td>Any future date</td>
                        <td>Any 3 digits</td>
                        <td>Any ZIP</td>
                    </tr>
                </tbody>
            </table>

            <h3>Steps to test payment:</h3>
            <ol class="steps">
                <li>Add items to your cart.</li>
                <li>Go to checkout.</li>
                <li>Enter the test card details above.</li>
                <li>Use any valid billing info (it's ignored in test mode).</li>
                <li>Complete the payment — the order will process as if it was successful.</li>
            </ol>

            <div class="note">
                <strong>Note:</strong> Stripe provides other test card numbers for different scenarios like failed payments, authentication, etc.
            </div>
        </div>

        <div class="footer">
            🚀 Ready to explore the full-stack e-commerce experience!
        </div>
    </div>

</body>
</html>
