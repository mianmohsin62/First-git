require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Database connection
const dbPath = path.join(__dirname, 'database', 'workshop.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token.' });
    }
    req.user = user;
    next();
  });
};

// Generate unique Job ID
function generateJobId() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `FE${timestamp}${random}`;
}

// ========== API ROUTES ==========

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Admin login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  });
});

// Get all repair jobs (Admin only)
app.get('/api/repairs', authenticateToken, (req, res) => {
  const { status, search } = req.query;
  
  let query = 'SELECT * FROM repair_jobs';
  let params = [];
  
  if (status && status !== 'All') {
    query += ' WHERE repair_status = ?';
    params.push(status);
  }
  
  if (search) {
    if (params.length > 0) {
      query += ' AND (job_id LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)';
    } else {
      query += ' WHERE (job_id LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)';
    }
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }
  
  query += ' ORDER BY created_at DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Get single repair job by Job ID
app.get('/api/repairs/:jobId', (req, res) => {
  const { jobId } = req.params;
  
  db.get('SELECT * FROM repair_jobs WHERE job_id = ?', [jobId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(row);
  });
});

// Check repair status (Public - by Job ID or Phone)
app.post('/api/check-status', (req, res) => {
  const { jobId, phone } = req.body;
  
  if (!jobId && !phone) {
    return res.status(400).json({ error: 'Job ID or Phone number is required' });
  }
  
  let query = 'SELECT * FROM repair_jobs WHERE ';
  let params = [];
  
  if (jobId) {
    query += 'job_id = ?';
    params.push(jobId);
  } else {
    query += 'customer_phone = ?';
    params.push(phone);
  }
  
  query += ' ORDER BY created_at DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No repair jobs found' });
    }
    res.json(rows);
  });
});

// Create new repair job (Admin only)
app.post('/api/repairs', authenticateToken, (req, res) => {
  const {
    customer_name,
    customer_phone,
    item_type,
    brand_model,
    problem_description,
    received_date,
    expected_completion,
    repair_cost
  } = req.body;

  if (!customer_name || !customer_phone || !item_type || !problem_description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const jobId = generateJobId();

  const query = `
    INSERT INTO repair_jobs (
      job_id, customer_name, customer_phone, item_type, brand_model,
      problem_description, received_date, expected_completion, repair_cost
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    jobId,
    customer_name,
    customer_phone,
    item_type,
    brand_model || '',
    problem_description,
    received_date || new Date().toISOString().split('T')[0],
    expected_completion || null,
    repair_cost || 0
  ];

  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Add to status history
    db.run(
      'INSERT INTO repair_status_history (job_id, status, changed_by) VALUES (?, ?, ?)',
      [jobId, 'Received', req.user.username]
    );

    res.status(201).json({
      message: 'Repair job created successfully',
      jobId: jobId,
      id: this.lastID
    });
  });
});

// Update repair job (Admin only)
app.put('/api/repairs/:jobId', authenticateToken, (req, res) => {
  const { jobId } = req.params;
  const {
    repair_status,
    repair_cost,
    payment_status,
    technician_notes,
    expected_completion,
    delivery_date
  } = req.body;

  const updates = [];
  const params = [];

  if (repair_status) {
    updates.push('repair_status = ?');
    params.push(repair_status);
    
    // Add to status history
    db.run(
      'INSERT INTO repair_status_history (job_id, status, notes, changed_by) VALUES (?, ?, ?, ?)',
      [jobId, repair_status, technician_notes || '', req.user.username]
    );
  }
  if (repair_cost !== undefined) {
    updates.push('repair_cost = ?');
    params.push(repair_cost);
  }
  if (payment_status) {
    updates.push('payment_status = ?');
    params.push(payment_status);
  }
  if (technician_notes) {
    updates.push('technician_notes = ?');
    params.push(technician_notes);
  }
  if (expected_completion) {
    updates.push('expected_completion = ?');
    params.push(expected_completion);
  }
  if (delivery_date) {
    updates.push('delivery_date = ?');
    params.push(delivery_date);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(jobId);

  const query = `UPDATE repair_jobs SET ${updates.join(', ')} WHERE job_id = ?`;

  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json({ message: 'Repair job updated successfully' });
  });
});

// Get dashboard statistics (Admin only)
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  const stats = {};

  db.get('SELECT COUNT(*) as total FROM repair_jobs', [], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    stats.total = row.total;

    db.get('SELECT COUNT(*) as pending FROM repair_jobs WHERE repair_status NOT IN ("Completed", "Delivered")', [], (err, row) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      stats.pending = row.pending;

      db.get('SELECT COUNT(*) as completed FROM repair_jobs WHERE repair_status = "Completed"', [], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        stats.completed = row.completed;

        db.get('SELECT COUNT(*) as delivered FROM repair_jobs WHERE repair_status = "Delivered"', [], (err, row) => {
          if (err) return res.status(500).json({ error: 'Database error' });
          stats.delivered = row.delivered;

          db.get('SELECT SUM(repair_cost) as total_revenue FROM repair_jobs WHERE payment_status = "Paid"', [], (err, row) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            stats.total_revenue = row.total_revenue || 0;

            res.json(stats);
          });
        });
      });
    });
  });
});

// Serve frontend pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/services', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'services.html'));
});

app.get('/check-status', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'check-status.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

app.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});
