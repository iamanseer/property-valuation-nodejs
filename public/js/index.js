let currentStep = 1;
const totalSteps = 3;

async function loadLocations() {
  try {
    const res = await fetch('/api/locations');
    if (!res.ok) throw new Error('Failed to load locations');
    const locations = await res.json();
    const select = document.getElementById('location');
    select.innerHTML = locations.map(loc => `<option>${loc}</option>`).join('');
    loadProjects();
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

async function loadProjects() {
  try {
    const location = document.getElementById('location').value;
    const res = await fetch(`/api/projects?location=${location}`);
    if (!res.ok) throw new Error('Failed to load projects');
    const projects = await res.json();
    const select = document.getElementById('project');
    select.innerHTML = projects.map(proj => `<option>${proj}</option>`).join('');
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

function nextStep(step) {
  document.querySelector(`#step${currentStep}`).classList.remove('active');
  currentStep = step;
  document.querySelector(`#step${currentStep}`).classList.add('active');
  document.querySelector('.progress').style.width = `${((currentStep - 1) / (totalSteps - 1)) * 100}%`;
}

async function submitForm() {
  const submitButton = document.getElementById('submitButton');
  const resultDiv = document.getElementById('valuationResult');
  submitButton.disabled = true;
  submitButton.classList.add('loading');
  resultDiv.innerHTML = '';

  const data = {
    location: document.getElementById('location').value,
    project: document.getElementById('project').value,
    property_type: document.getElementById('propertyType').value,
    size: parseInt(document.getElementById('size').value),
    bedrooms: parseInt(document.getElementById('bedrooms').value),
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value
  };

  // Validation
  if (!data.location || !data.project || !data.property_type || !data.size || !data.bedrooms || !data.name || !data.email || !data.phone) {
    resultDiv.innerHTML = '<div class="error">Please fill in all fields.</div>';
    submitButton.disabled = false;
    submitButton.classList.remove('loading');
    return;
  }
  if (data.size <= 0 || data.bedrooms < 0) {
    resultDiv.innerHTML = '<div class="error">Size must be greater than 0, and bedrooms cannot be negative.</div>';
    submitButton.disabled = false;
    submitButton.classList.remove('loading');
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    resultDiv.innerHTML = '<div class="error">Please enter a valid email address.</div>';
    submitButton.disabled = false;
    submitButton.classList.remove('loading');
    return;
  }
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(data.phone)) {
    resultDiv.innerHTML = '<div class="error">Please enter a valid phone number (e.g., +971501234567).</div>';
    submitButton.disabled = false;
    submitButton.classList.remove('loading');
    return;
  }

  try {
    const submitRes = await fetch('/api/valuate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!submitRes.ok) {
      const errorData = await submitRes.json();
      throw new Error(errorData.error || 'Failed to submit valuation request');
    }
    const submitResult = await submitRes.json();

    const calcRes = await fetch('/api/calculate-valuation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: data.location,
        project: data.project,
        property_type: data.property_type,
        size: data.size,
        bedrooms: data.bedrooms
      })
    });
    if (!calcRes.ok) {
      const errorData = await calcRes.json();
      throw new Error(errorData.error || 'Failed to calculate valuation');
    }
    const calcResult = await calcRes.json();

    resultDiv.innerHTML = `Thank you, ${data.name}! Your valuation request (#${submitResult.id}) has been submitted.<br>Estimated Valuation: ${calcResult.valuation}`;
  } catch (error) {
    resultDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
  } finally {
    submitButton.disabled = false;
    submitButton.classList.remove('loading');
  }
}

// Load initial data
loadLocations();