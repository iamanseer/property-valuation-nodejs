async function loadTransactions() {
  try {
    const res = await fetch('/api/transactions');
    if (!res.ok) throw new Error('Failed to load transactions');
    const transactions = await res.json();
    const tbody = document.querySelector('#transactionsTable tbody');
    tbody.innerHTML = transactions.map(t => `<tr><td>${t.id}</td><td>${t.location}</td><td>${t.project}</td><td>${t.property_type}</td><td>${t.size}</td><td>${t.bedrooms}</td><td>${t.price}</td><td>${t.date}</td></tr>`).join('');
  } catch (error) {
    document.querySelector('#addResult').innerHTML = `<div class="error">Error: ${error.message}</div>`;
  }
}

async function addTransaction() {
  const addButton = document.getElementById('addButton');
  const resultDiv = document.getElementById('addResult');
  addButton.disabled = true;
  addButton.classList.add('loading');
  resultDiv.innerHTML = '';

  const data = {
    location: document.getElementById('location').value,
    project: document.getElementById('project').value,
    property_type: document.getElementById('property_type').value,
    size: parseInt(document.getElementById('size').value),
    bedrooms: parseInt(document.getElementById('bedrooms').value),
    price: parseFloat(document.getElementById('price').value),
    date: document.getElementById('date').value
  };

  if (!data.location || !data.project || !data.property_type || !data.size || !data.bedrooms || !data.price || !data.date) {
    resultDiv.innerHTML = '<div class="error">Please fill in all fields.</div>';
    addButton.disabled = false;
    addButton.classList.remove('loading');
    return;
  }
  if (data.size <= 0 || data.bedrooms < 0 || data.price <= 0) {
    resultDiv.innerHTML = '<div class="error">Size and price must be greater than 0, and bedrooms cannot be negative.</div>';
    addButton.disabled = false;
    addButton.classList.remove('loading');
    return;
  }

  try {
    const res = await fetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to add transaction');
    }
    const result = await res.json();
    resultDiv.innerHTML = `<div class="success">Transaction added successfully (ID: ${result.id})</div>`;
    loadTransactions();
  } catch (error) {
    resultDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
  } finally {
    addButton.disabled = false;
    addButton.classList.remove('loading');
  }
}

async function uploadCSV() {
  const uploadButton = document.getElementById('uploadButton');
  const resultDiv = document.getElementById('uploadResult');
  uploadButton.disabled = true;
  uploadButton.classList.add('loading');
  resultDiv.innerHTML = '';

  const fileInput = document.getElementById('csvFile');
  const file = fileInput.files[0];
  if (!file) {
    resultDiv.innerHTML = '<div class="error">Please select a CSV file.</div>';
    uploadButton.disabled = false;
    uploadButton.classList.remove('loading');
    return;
  }

  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const text = e.target.result;
      const rows = text.split('\n').map(row => row.trim()).filter(row => row);
      if (rows.length <= 1) {
        throw new Error('CSV file is empty or missing data rows');
      }
      const transactions = rows.slice(1).map(row => {
        const [location, project, property_type, size, bedrooms, price, date] = row.split(',').map(item => item.trim());
        return {
          location,
          project,
          property_type,
          size: parseInt(size),
          bedrooms: parseInt(bedrooms),
          price: parseFloat(price),
          date
        };
      });

      for (const t of transactions) {
        if (!t.location || !t.project || !t.property_type || !t.size || !t.bedrooms || !t.price || !t.date) {
          throw new Error('Invalid CSV data: All fields are required');
        }
        if (t.size <= 0 || t.bedrooms < 0 || t.price <= 0) {
          throw new Error('Invalid CSV data: Size and price must be greater than 0, bedrooms cannot be negative');
        }
      }

      const res = await fetch('/api/bulk-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to upload transactions');
      }
      const result = await res.json();
      resultDiv.innerHTML = `<div class="success">Bulk upload completed: ${result.count} transactions added.</div>`;
      loadTransactions();
    } catch (error) {
      resultDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    } finally {
      uploadButton.disabled = false;
      uploadButton.classList.remove('loading');
    }
  };
  reader.readAsText(file);
}

// Load initial transactions
loadTransactions();