const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(__dirname, 'workshop.db');
const db = new sqlite3.Database(dbPath);

console.log('Initializing database...');

db.serialize(() => {
  // Create users table (for admin)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create customers table
  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create repair_jobs table
  db.run(`
    CREATE TABLE IF NOT EXISTS repair_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id TEXT UNIQUE NOT NULL,
      customer_id INTEGER,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      item_type TEXT NOT NULL,
      brand_model TEXT,
      problem_description TEXT NOT NULL,
      received_date DATE NOT NULL,
      expected_completion DATE,
      delivery_date DATE,
      repair_status TEXT DEFAULT 'Received',
      repair_cost DECIMAL(10,2) DEFAULT 0,
      payment_status TEXT DEFAULT 'Pending',
      technician_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);

  // Create repair_status_history table
  db.run(`
    CREATE TABLE IF NOT EXISTS repair_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id TEXT NOT NULL,
      status TEXT NOT NULL,
      notes TEXT,
      changed_by TEXT,
      changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES repair_jobs(job_id)
    )
  `);

  // Insert default admin user
  bcrypt.hash('admin123', 10).then(defaultPassword => {
    db.run(`
      INSERT OR IGNORE INTO users (username, password, email, role)
      VALUES ('admin', ?, 'admin@fahadelectric.com', 'admin')
    `, [defaultPassword], (err) => {
      if (err) {
        console.error('Error creating admin user:', err);
      } else {
        console.log('Default admin user created (username: admin, password: admin123)');
      }
      
      console.log('Database initialized successfully!');
      console.log('Database location:', dbPath);
      console.log('\nDefault admin credentials:');
      console.log('Username: admin');
      console.log('Password: admin123');
      console.log('\nPlease change the default password after first login!');
      
      // Close database after all operations complete
      db.close();
    });
  }).catch(err => {
    console.error('Error hashing password:', err);
    db.close();
  });
});
