const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const db = new sqlite3.Database('./data/valuation.db');

app.get('/api/locations', (req, res) => {
  db.all('SELECT DISTINCT location FROM location_project_mapping', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(row => row.location));
  });
});

app.get('/api/projects', (req, res) => {
  const { location } = req.query;
  db.all('SELECT project FROM location_project_mapping WHERE location = ?', [location], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(row => row.project));
  });
});

app.post('/api/valuate', (req, res) => {
  const { location, project, propertyType, size, bedrooms, name, email, phone } = req.body;
  db.run('INSERT INTO valuation_requests (location, project, property_type, size, bedrooms, name, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [location, project, propertyType, size, bedrooms, name, email, phone], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Valuation request submitted' });
    });
});

app.get('/api/transactions', (req, res) => {
  db.all('SELECT * FROM transactions', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/transactions', (req, res) => {
  const { location, project, property_type, size, bedrooms, price, date } = req.body;
  db.run('INSERT INTO transactions (location, project, property_type, size, bedrooms, price, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [location, project, property_type, size, bedrooms, price, date], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
