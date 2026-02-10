# Fahad Electric Store & Electronics - Workshop Management System

A professional, modern workshop management website for electrical & electronics repair business. This system enables digital management of repair tasks, customer records, and online status tracking.

## 🏪 Business Information

**Fahad Electric Store & Electronics**  
Professional Electrical & Electronics Technician

📍 **Address**: Defense Road, Mohala Rasheed Park, Near Nadar Nashta Point, Jaranwala  
📱 **Phone**: +92 301 7123035  
📞 **Alternate**: +92 303 6279532  
💬 **WhatsApp**: +92 3036279532  
📧 **Email**: mianashraf23035@gmail.com  
🕒 **Working Hours**: 9AM-10PM  
🗺️ **Google Maps**: [View Location](https://maps.app.goo.gl/nrPkcXKAiByWHAQj8)

## 🎯 Features

### For Customers
- ✅ Check repair status online using Job ID or phone number
- ✅ View repair progress, cost, and expected completion date
- ✅ No login required for status checking
- ✅ Bilingual interface (English/Urdu)
- ✅ Mobile-friendly responsive design

### For Admin/Workshop Owner
- ✅ Secure admin login
- ✅ Dashboard with repair statistics
- ✅ Add new repair records with auto-generated Job ID
- ✅ Update repair status and cost
- ✅ Add technician notes
- ✅ Search by customer name, phone, or Job ID
- ✅ Filter jobs by status
- ✅ Mark jobs as completed or delivered
- ✅ Track payment status

## 🛠️ Services Offered

- 📺 TV / LED Repair
- 🔋 UPS Repair
- ❄️ AC Kits
- ⚙️ Motors
- 🔌 Electrical Appliances
- 🔧 Electronic Circuits & Kits
- 💡 Power Supplies
- 🏠 Household & Industrial Electronics

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd First-git
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and update the `JWT_SECRET` with a secure random string.

4. **Initialize the database**
   ```bash
   npm run init-db
   ```
   This will create the database and default admin user.

5. **Start the server**
   ```bash
   npm start
   ```
   For development with auto-reload:
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Website: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin

### Default Admin Credentials
- **Username**: admin
- **Password**: admin123

⚠️ **IMPORTANT**: Change the default admin password immediately after first login!

## 📁 Project Structure

```
First-git/
├── database/
│   ├── init.js              # Database initialization script
│   └── workshop.db          # SQLite database (created after init)
├── public/
│   ├── css/
│   │   └── style.css        # Main stylesheet
│   ├── index.html           # Home page
│   ├── about.html           # About us page
│   ├── services.html        # Services page
│   ├── check-status.html    # Customer status check page
│   ├── contact.html         # Contact page
│   ├── admin-login.html     # Admin login page
│   └── admin-dashboard.html # Admin dashboard
├── server.js                # Express server & API routes
├── package.json             # Project dependencies
├── .env.example             # Environment variables template
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## 🗄️ Database Schema

### Tables

**users** - Admin user accounts
- id, username, password, email, role, created_at

**customers** - Customer information
- id, name, phone, email, address, created_at

**repair_jobs** - Repair job records
- id, job_id, customer_id, customer_name, customer_phone
- item_type, brand_model, problem_description
- received_date, expected_completion, delivery_date
- repair_status, repair_cost, payment_status
- technician_notes, created_at, updated_at

**repair_status_history** - Status change tracking
- id, job_id, status, notes, changed_by, changed_at

## 🔐 API Endpoints

### Public Endpoints
- `GET /` - Home page
- `GET /about` - About page
- `GET /services` - Services page
- `GET /check-status` - Status check page
- `GET /contact` - Contact page
- `POST /api/check-status` - Check repair status
- `POST /api/auth/login` - Admin login

### Protected Admin Endpoints
- `GET /api/repairs` - Get all repair jobs (with filters)
- `GET /api/repairs/:jobId` - Get single repair job
- `POST /api/repairs` - Create new repair job
- `PUT /api/repairs/:jobId` - Update repair job
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🔄 Repair Status Options

1. **Received** - Device received at workshop
2. **Diagnosing** - Checking for issues
3. **In Repair** - Actively being repaired
4. **Waiting for Parts** - Awaiting replacement parts
5. **Completed** - Repair finished
6. **Delivered** - Returned to customer

## 💳 Payment Status

- **Pending** - Payment not yet received
- **Paid** - Payment completed

## 🌐 Pages Overview

### Customer-Facing Pages
1. **Home** - Introduction and key features
2. **About Us** - Business information and mission
3. **Services** - Detailed service offerings
4. **Check Status** - Track repair progress
5. **Contact** - Contact information and location

### Admin Pages
1. **Admin Login** - Secure authentication
2. **Admin Dashboard** - Complete management interface
   - View statistics
   - Search and filter jobs
   - Add new repair jobs
   - Update existing jobs
   - Track payments

## 🎨 UI/UX Features

- ✅ Clean and professional design
- ✅ Mobile-first responsive layout
- ✅ Fast loading times
- ✅ Bilingual support (English/Urdu)
- ✅ Easy navigation
- ✅ Color-coded status badges
- ✅ Print-friendly layouts
- ✅ Accessible forms

## 🔧 Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Authentication**: JWT (JSON Web Tokens)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Security**: bcryptjs for password hashing

## 🛡️ Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT-based authentication
- ✅ Role-based access control
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ Secure token storage

## 📱 Mobile Support

The website is fully responsive and optimized for:
- Mobile phones
- Tablets
- Desktops
- Large screens

## 🚀 Future Features (Optional)

- [ ] Repair history per customer
- [ ] Invoice PDF generation
- [ ] Inventory / parts management
- [ ] Expense & profit tracking
- [ ] Multi-technician support
- [ ] Online appointment booking
- [ ] WhatsApp/SMS notifications
- [ ] Image upload for devices
- [ ] Customer ratings & feedback

## 📝 Usage Guide

### For Workshop Admin

1. **Login**: Go to `/admin` and login with your credentials
2. **Add New Job**: Click "Add New Repair Job" button
3. **Fill Details**: Enter customer and device information
4. **Generate Job ID**: System auto-generates unique Job ID
5. **Update Status**: Edit jobs to update status and cost
6. **Track Progress**: View all jobs in dashboard
7. **Search**: Use search and filters to find specific jobs

### For Customers

1. **Visit Website**: Go to the main website
2. **Check Status**: Click "Check Repair Status"
3. **Enter Details**: Enter your Job ID or phone number
4. **View Status**: See current repair status and cost
5. **Contact**: Contact workshop if needed

## 🤝 Support

For any issues or questions:
- 📱 Call: +92 301 7123035
- 💬 WhatsApp: +92 303 6279532
- 📧 Email: mianashraf23035@gmail.com

## 📄 License

MIT License - feel free to use and modify for your business needs.

## 👨‍💻 Development

### Running in Development Mode
```bash
npm run dev
```

### Reinitialize Database
```bash
npm run init-db
```

⚠️ Warning: This will delete all existing data!

## 🔄 Backup & Restore

### Backup Database
```bash
cp database/workshop.db database/workshop.db.backup
```

### Restore Database
```bash
cp database/workshop.db.backup database/workshop.db
```

## 📊 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| JWT_SECRET | Secret key for JWT | (required) |
| NODE_ENV | Environment | development |
| DB_PATH | Database file path | ./database/workshop.db |

## 🎯 Best Practices

1. **Change default admin password** immediately after setup
2. **Backup database** regularly
3. **Keep JWT_SECRET** secure and random
4. **Use HTTPS** in production
5. **Update dependencies** regularly
6. **Monitor disk space** for database growth

---

**Built with ❤️ for Fahad Electric Store & Electronics**

فہد الیکٹرک اسٹور اینڈ الیکٹرانکس
