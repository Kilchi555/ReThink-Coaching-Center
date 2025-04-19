const customerDashboard = document.getElementById('customer-dashboard');
const employeeDashboard = document.getElementById('employee-dashboard');
const adminDashboard = document.getElementById('admin-dashboard');
const pastAppointmentsList = document.getElementById('past-appointments-list');
const futureAppointmentsList = document.getElementById('future-appointments-list');
const logoutButton = document.getElementById('logoutButton');

function checkLoginStatus() {
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');
  if (userId && userRole) {
    showDashboardContent(userRole);
    fetchAndDisplayAppointments();
  } else {
    // Wenn nicht eingeloggt, zurück zur Startseite oder Login-Seite
    window.location.href = '/login.html';
  }
}

function showDashboardContent(role) {
  customerDashboard.classList.add('hidden');
  employeeDashboard.classList.add('hidden');
  adminDashboard.classList.add('hidden');

  if (role === 'kunde') {
    customerDashboard.classList.remove('hidden');
  } else if (role === 'mitarbeiter') {
    employeeDashboard.classList.remove('hidden');
  } else if (role === 'admin') {
    adminDashboard.classList.remove('hidden');
  }
}

async function fetchAndDisplayAppointments() {
  await fetchAndDisplayPastAppointments();
  await fetchAndDisplayFutureAppointments();
}

async function fetchAndDisplayPastAppointments() {
  try {
    const response = await fetch('/api/past-appointments');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    displayAppointments(pastAppointmentsList, data.pastAppointments);
  } catch (error) {
    console.error('Fehler beim Abrufen vergangener Termine:', error);
    pastAppointmentsList.innerHTML = '<li class="error-message">Fehler beim Laden der Termine.</li>';
  }
}

async function fetchAndDisplayFutureAppointments() {
  try {
    const response = await fetch('/api/future-appointments');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    displayAppointments(futureAppointmentsList, data.futureAppointments);
  } catch (error) {
    console.error('Fehler beim Abrufen zukünftiger Termine:', error);
    futureAppointmentsList.innerHTML = '<li class="error-message">Fehler beim Laden der Termine.</li>';
  }
}

function displayAppointments(listElement, appointments) {
  listElement.innerHTML = '';
  if (appointments && appointments.length > 0) {
    appointments.forEach(appointment => {
      const listItem = document.createElement('li');
      const startTime = new Date(appointment.start_time).toLocaleString();
      const endTime = new Date(appointment.end_time).toLocaleString();
      listItem.textContent = `Start: ${startTime}, Ende: ${endTime}`;
      listElement.appendChild(listItem);
    });
  } else {
    const listItem = document.createElement('li');
    listItem.textContent = 'Keine Termine gefunden.';
    listElement.appendChild(listItem);
  }
}

logoutButton.addEventListener('click', () => {
  localStorage.removeItem('userId');
  localStorage.removeItem('userRole');
  window.location.href = '/login.html';
});

checkLoginStatus();