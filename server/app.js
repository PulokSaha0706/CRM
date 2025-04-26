// server.js or app.js in your Node.js project
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 5000;

// Enable CORS for frontend communication
app.use(cors());

// Create a MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '.jdtgmpwat', // Your MySQL password
  database: 'crm2', // Your MySQL database name
});

// Connect to MySQL
db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL!');
});

// API to get customer statistics
app.get('/api/stats', (req, res) => {
    console.log("here");
  const query = 'SELECT COUNT(*) AS total_customers FROM customers';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }
    
    const totalCustomers = results[0].total_customers;
    
    // Simulate different types of customers
    const leads = Math.floor(totalCustomers * 0.2); // Example: 20% are leads
    const clients = Math.floor(totalCustomers * 0.6); // Example: 60% are clients
    
    // Send the statistics
    res.json({
      totalCustomers,
      leads,
      clients,
    });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
