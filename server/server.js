// backend/app.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csvParser = require('csv-parser');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// DB Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '.jdtgmpwat',
  database: 'crm2',
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1); // Exit app if DB connection fails
  }
  console.log('✅ Connected to MySQL database.');
});

// Stats Endpoint
app.get('/api/stats', (req, res) => {
  console.log('📊 Fetching stats...');

  // 1. Get total number of customers
  const totalQuery = 'SELECT COUNT(*) AS total_customers FROM customers';
  db.query(totalQuery, (err, totalResult) => {
    if (err) {
      console.error('❌ Error fetching total customers:', err);
      return res.status(500).json({ error: 'Failed to fetch total customers' });
    }

    const totalCustomers = totalResult[0].total_customers;

    // 2. Count leads by joining customer_tags and tags
    const leadsQuery = `
      SELECT COUNT(DISTINCT ct.customer_id) AS leads
      FROM customer_tags ct
      JOIN tags t ON ct.tag_id = t.id
      WHERE t.name = 'Lead'
    `;
    db.query(leadsQuery, (err, leadsResult) => {
      if (err) {
        console.error('❌ Error fetching leads:', err);
        return res.status(500).json({ error: 'Failed to fetch leads data' });
      }

      const leads = leadsResult[0].leads;

      // 3. Count clients
      const clientsQuery = `
        SELECT COUNT(DISTINCT ct.customer_id) AS clients
        FROM customer_tags ct
        JOIN tags t ON ct.tag_id = t.id
        WHERE t.name = 'Client'
      `;
      db.query(clientsQuery, (err, clientsResult) => {
        if (err) {
          console.error('❌ Error fetching clients:', err);
          return res.status(500).json({ error: 'Failed to fetch clients data' });
        }

        const clients = clientsResult[0].clients;

        res.json({
          totalCustomers,
          leads,
          clients,
        });
      });
    });
  });
});

// Customers Endpoint
app.get('/api/customers', (req, res) => {
  const { search, tag } = req.query;

  // Base query to get all customers with their tags
  let query = `
    SELECT customers.id, customers.name, customers.email, customers.phone, customers.company,
    GROUP_CONCAT(tags.name) AS tags
    FROM customers
    LEFT JOIN customer_tags ON customers.id = customer_tags.customer_id
    LEFT JOIN tags ON customer_tags.tag_id = tags.id
  `;

  // Add search filters if needed
  if (search) {
    query += ` WHERE customers.name LIKE ? OR customers.email LIKE ? OR customers.phone LIKE ?`;
  }

  // Add tag filter if provided
  if (tag) {
    if (search) {
      query += ` AND tags.name LIKE ?`;
    } else {
      query += ` WHERE tags.name LIKE ?`;
    }
  }

  query += ` GROUP BY customers.id`;

  // Execute the query with the necessary parameters
  const params = [];
  if (search) {
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  if (tag) {
    params.push(`%${tag}%`);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching customers:', err);
      return res.status(500).json({ error: 'Failed to fetch customers' });
    }

    res.json(results);
  });
});

// Add Tag to Customer
app.post('/api/customer-tags', (req, res) => {
  const { customerId, tagId } = req.body;

  // Ensure customerId and tagId are provided
  if (!customerId || !tagId) {
    return res.status(400).json({ error: 'Customer ID and Tag ID are required' });
  }

  // Insert a new entry in the customer_tags table
  const query = 'INSERT INTO customer_tags (customer_id, tag_id) VALUES (?, ?)';
  db.query(query, [customerId, tagId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to add tag to customer' });
    }
    res.json({ message: 'Tag added successfully' });
  });
});

// Fetch Tags
app.get('/api/tags', (req, res) => {
  // SQL query to fetch all tags
  const query = 'SELECT * FROM tags';

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch tags' });
    }

    // Send the tags data as a JSON response
    res.json(results);
  });
});

// Set up multer storage and file upload handling
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // Save files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Give unique names to files
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileType = path.extname(file.originalname).toLowerCase();
    if (fileType === '.csv') {
      cb(null, true); // Accept CSV files
    } else {
      cb(new Error('Only CSV files are allowed'), false); // Reject non-CSV files
    }
  },
});

// API endpoint to handle file upload
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // Get the file path
  const filePath = req.file.path;

  // Process the CSV file
  processCSVFile(filePath, res);
});

// Function to process CSV files
const processCSVFile = (filePath, res) => {
  const customers = [];
  const seenKeys = new Set(); // Set to track already seen keys (email/phone combination)

  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on('data', (row) => {
      const key = `${row.email || ''}-${row.phone || ''}`; // Create unique key based on email and phone
      if (!seenKeys.has(key)) {
        customers.push(row); // Add the row if the key is not already seen
        seenKeys.add(key); // Mark this key as seen
      }
    })
    .on('end', () => {
      console.log('CSV file processed');
      saveCustomersToDB(customers, res);
    })
    .on('error', (err) => {
      console.error('Error processing CSV file:', err);
      res.status(500).json({ message: 'Error processing CSV file' });
    });
};

// Function to save customers to the database, skipping duplicates
const saveCustomersToDB = (customers, res) => {
  // Iterate through each customer and check if they already exist in the database
  let newCustomers = [];

  let processedCount = 0;

  customers.forEach((customer) => {
    // Check if customer already exists based on email or phone
    const query = 'SELECT * FROM customers WHERE email = ? OR phone = ?';
    db.query(query, [customer.email, customer.phone], (err, result) => {
      if (err) {
        console.error('Error checking for duplicate customer:', err);
        return res.status(500).json({ message: 'Error checking for duplicates' });
      }

      if (result.length === 0) {
        // Customer doesn't exist, add to the list of new customers
        newCustomers.push([customer.name, customer.email, customer.phone, customer.company]);
      }

      // Increment processed count
      processedCount++;

      // If all customers have been processed, save them to the database
      if (processedCount === customers.length) {
        if (newCustomers.length > 0) {
          const query = 'INSERT INTO customers (name, email, phone, company) VALUES ?';
          db.query(query, [newCustomers], (err, result) => {
            if (err) {
              console.error('Error saving customers to database:', err);
              return res.status(500).json({ message: 'Error saving customers to database' });
            }
            console.log('Customers saved to database');
            res.status(200).json({ message: 'Customers uploaded successfully' });
          });
        } else {
          res.status(200).json({ message: 'No new customers to upload' });
        }
      }
    });
  });
};

app.use('/uploads', express.static('uploads'));

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
