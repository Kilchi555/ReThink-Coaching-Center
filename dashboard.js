const customerDashboard = document.getElementById('customer-dashboard');
const employeeDashboard = document.getElementById('employee-dashboard');
const adminDashboard = document.getElementById('admin-dashboard');
const pastAppointmentsList = document.getElementById('past-appointments-list');
const futureAppointmentsList = document.getElementById('future-appointments-list');
const logoutButton = document.getElementById('logoutButton');
const userEmailElement = document.getElementById('user-email'); // Element für Benutzer-E-Mail

function checkLoginStatus() {
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole'); // Hole userRole aus localStorage
fetchAndDisplayAppointments(userRole);
  const userEmail = localStorage.getItem('userEmail'); // E-Mail aus localStorage holen

  if (userId && userRole) {
    showDashboardContent(userRole);
    fetchAndDisplayAppointments();
    displayUserInfo(userEmail); // E-Mail anzeigen
  } else {
    // Wenn nicht eingeloggt, zurück zur Login-Seite
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

function displayUserInfo(email) {
  if (userEmailElement) {
    userEmailElement.textContent = `Eingeloggt als: ${email}`; // E-Mail im Dashboard anzeigen
  }
}

async function fetchAndDisplayAppointments(userRole) {
  await fetchAndDisplayPastAppointments(userRole);
  await fetchAndDisplayFutureAppointments(userRole);
}

async function fetchAndDisplayPastAppointments(userRole) {
  try {
    const response = await fetch('/api/past-appointments', {
      method: 'GET',
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    displayAppointments(pastAppointmentsList, data, userRole); // userRole hier übergeben
  } catch (error) {
    console.error('Fehler beim Abrufen vergangener Termine:', error);
    pastAppointmentsList.innerHTML = '<li class="error-message">Fehler beim Laden der Termine.</li>';
  }
}



async function fetchAndDisplayFutureAppointments(userRole) {
  try {
    const response = await fetch('/api/future-appointments', {
      method: 'GET',
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    displayAppointments(futureAppointmentsList, data, userRole); // userRole hier übergeben
  } catch (error) {
    console.error('Fehler beim Abrufen zukünftiger Termine:', error);
    futureAppointmentsList.innerHTML = '<li class="error-message">Fehler beim Laden der Termine.</li>';
  }
}



function displayAppointments(listElement, appointments, userRole) {
  listElement.innerHTML = '';  // Leere Liste, um neue Einträge hinzuzufügen
  if (appointments && appointments.length > 0) {
    appointments.forEach(appointment => {
      const listItem = document.createElement('li');
      
      const start = new Date(appointment.start_time).toLocaleString();
      const end = new Date(appointment.end_time).toLocaleString();

      // Initialisiere die Notizsektion für den Kunden und den Mitarbeiter
      let noteSection = '';

      if (userRole === 'kunde') {
        noteSection = `
          <label>Kundennotiz:</label><br>
          <textarea data-id="${appointment._id}" class="note-textarea customer">${appointment.customerNote || ''}</textarea>
          <button data-id="${appointment._id}" class="save-note-button customer">Speichern</button>
        `;
      } else if (userRole === 'mitarbeiter') {
        noteSection = `
          <label>Mitarbeiternotiz:</label><br>
          <textarea data-id="${appointment._id}" class="note-textarea employee">${appointment.employeeNote || ''}</textarea>
          <button data-id="${appointment._id}" class="save-note-button employee">Speichern</button>
        `;
      }

      // HTML für das Termin-Element erstellen
      listItem.innerHTML = `
        <div>
          <strong>Start:</strong> ${start}<br>
          <strong>Ende:</strong> ${end}<br>
          ${noteSection} <!-- Notizenbereich wird hier eingefügt -->
        </div>
      `;

      listElement.appendChild(listItem);
    });

    // EventListener hinzufügen, um Notizen zu speichern
    const buttons = listElement.querySelectorAll('.save-note-button');
    buttons.forEach(button => {
      button.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        const textarea = listElement.querySelector(`textarea[data-id="${id}"]`);
        const note = textarea.value;
        const role = textarea.classList.contains('customer') ? 'customer' : 'employee';

        try {
          const response = await fetch('/api/update-note', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
              appointmentId: id,
              note,
              type: role
            })
          });

          if (!response.ok) throw new Error('Fehler beim Speichern.');

          alert('Notiz gespeichert!');
        } catch (err) {
          console.error('Speichern fehlgeschlagen:', err);
          alert('Speichern der Notiz fehlgeschlagen.');
        }
      });
    });

  } else {
    listElement.innerHTML = '<li>Keine Termine gefunden.</li>';
  }
}

logoutButton.addEventListener('click', () => {
  // Lösche Benutzerdaten und leite zur Login-Seite weiter
  localStorage.removeItem('userId');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userEmail');
  window.location.href = '/login.html';
});

checkLoginStatus();
