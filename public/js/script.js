// js/script.js

// Öffnen des Menüs bei Klick auf den Button
document.getElementById('menu-toggle').addEventListener('click', function() {
  const navbar = document.getElementById('navbar');
  navbar.classList.toggle('active'); // Fügt die "active"-Klasse hinzu oder entfernt sie
});

const menuLinks = document.querySelectorAll('.navbar a'); // Alle Links im Menü

menuLinks.forEach(link => {
  link.addEventListener('click', function() {
    const navbar = document.getElementById('navbar');
    navbar.classList.remove('active'); // Entfernt die "active"-Klasse, um das Menü zu schließen
  });
});

// Schließe das Menü, wenn irgendwo außerhalb des Menüs geklickt wird
document.addEventListener('click', function(event) {
    navbar.querySelector('ul').classList.remove('active'); // Menü schließen
});

  
  
  // FAQ-Toggles
  document.querySelectorAll('.faq-question').forEach((question) => {
    question.addEventListener('click', () => {
      const faqItem = question.parentElement;
      faqItem.classList.toggle('active');
  
      // Optional: alle anderen schließen
      document.querySelectorAll('.faq-item').forEach((item) => {
        if (item !== faqItem) {
          item.classList.remove('active');
        }
      });
    });
  });


// Stelle sicher, dass das Calendly-Widget geladen ist, bevor der Button hinzugefügt wird
window.onload = function() {
    // Initialisiere das Calendly Widget im unteren rechten Bereich
    Calendly.initBadgeWidget({
      url: 'https://calendly.com/pascal_kilchenmann/kostenloses-kennenlern-gespraech',
      text: 'Termin buchen',
      color: '#0069ff',
      textColor: '#ffffff'
    });

    // Event-Listener für das Erstellen eines weiteren Buttons an einem anderen Ort auf der Seite
    document.getElementById('calendly-button-container').addEventListener('click', function() {
      // Hier kannst du einen zweiten Button mit verschiedenen Parametern einfügen
      Calendly.initPopupWidget({
        url: 'https://calendly.com/pascal_kilchenmann/kostenloses-kennenlern-gespraech'
      });
    });
  };
  
  document.addEventListener('DOMContentLoaded', function() {
    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
      loginButton.addEventListener('click', function() {
        window.location.href = 'login.html';
      });
    }
  });


  // ... (vorheriger JavaScript-Code) ...

const loginButton = document.getElementById('loginButton');
const loginSection = document.getElementById('login-section');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

const customerDashboard = document.getElementById('customer-dashboard');
const employeeDashboard = document.getElementById('employee-dashboard');
const adminDashboard = document.getElementById('admin-dashboard');
const pastAppointmentsSection = document.getElementById('past-appointments-section');
const futureAppointmentsSection = document.getElementById('future-appointments-section');
const registerSection = document.getElementById('register-section');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');

loginButton.addEventListener('click', () => {
  loginSection.style.display = 'block';
  // Verstecke ggf. andere Bereiche
  registerSection.style.display = 'none';
  customerDashboard.style.display = 'none';
  employeeDashboard.style.display = 'none';
  adminDashboard.style.display = 'none';
  pastAppointmentsSection.style.display = 'none';
  futureAppointmentsSection.style.display = 'none';
});

showRegisterLink.addEventListener('click', (event) => {
  event.preventDefault();
  loginSection.style.display = 'none';
  registerSection.style.display = 'block';
});

showLoginLink.addEventListener('click', (event) => {
  event.preventDefault();
  loginSection.style.display = 'block';
  registerSection.style.display = 'none';
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Login erfolgreich:', data);
      loginSection.style.display = 'none';
      loginError.style.display = 'none';
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('userRole', data.role);
      // Weiterleitung zum Dashboard basierend auf der Rolle
      handleLoginSuccess(data.role);
      // Erneutes Laden der Termine für den eingeloggten Benutzer
      fetchAndDisplayPastAppointments();
      fetchAndDisplayFutureAppointments();
    } else {
      const errorData = await response.json();
      console.error('Login fehlgeschlagen:', errorData);
      loginError.style.display = 'block';
    }
  } catch (error) {
    console.error('Fehler beim Login-Request:', error);
    loginError.textContent = 'Verbindungsfehler.';
    loginError.style.display = 'block';
  }
});

function handleLoginSuccess(role) {
  customerDashboard.style.display = 'none';
  employeeDashboard.style.display = 'none';
  adminDashboard.style.display = 'none';
  pastAppointmentsSection.style.display = 'block';
  futureAppointmentsSection.style.display = 'block';

  if (role === 'kunde') {
    customerDashboard.style.display = 'block';
  } else if (role === 'mitarbeiter') {
    employeeDashboard.style.display = 'block';
  } else if (role === 'admin') {
    adminDashboard.style.display = 'block';
  }
}

// Funktion zum Überprüfen des Login-Status beim Laden der Seite (optional)
function checkLoginStatus() {
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');
  if (userId && userRole) {
    loginSection.style.display = 'none';
    handleLoginSuccess(userRole);
    fetchAndDisplayPastAppointments();
    fetchAndDisplayFutureAppointments();
  } else {
    loginSection.style.display = 'none'; // Sicherstellen, dass Login-Bereich nicht angezeigt wird
    customerDashboard.style.display = 'none';
    employeeDashboard.style.display = 'none';
    adminDashboard.style.display = 'none';
    pastAppointmentsSection.style.display = 'block'; // Oder was auch immer die Startansicht sein soll
    futureAppointmentsSection.style.display = 'block';
  }
}

checkLoginStatus();