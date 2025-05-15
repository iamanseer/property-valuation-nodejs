const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./data/valuation.db');

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, location TEXT, project TEXT, property_type TEXT, size INTEGER, bedrooms INTEGER, price REAL, date TEXT)');
  db.run('CREATE TABLE IF NOT EXISTS valuation_requests (id INTEGER PRIMARY KEY AUTOINCREMENT, location TEXT, project TEXT, property_type TEXT, size INTEGER, bedrooms INTEGER, name TEXT, email TEXT, phone TEXT)');
  db.run('CREATE TABLE IF NOT EXISTS location_project_mapping (id INTEGER PRIMARY KEY AUTOINCREMENT, location TEXT, project TEXT)');

  db.run('INSERT INTO transactions (location, project, property_type, size, bedrooms, price, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['Downtown Dubai', 'Burj Al Arab', 'Apartment', 1200, 2, 3000000, '2025-01-15']);
  db.run('INSERT INTO location_project_mapping (location, project) VALUES (?, ?)', ['Downtown Dubai', 'Burj Al Arab']);
  db.run('INSERT INTO location_project_mapping (location, project) VALUES (?, ?)', ['Downtown Dubai', 'Emaar Square']);
});
db.close();
