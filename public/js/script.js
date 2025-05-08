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

  // Definiere die Backend-URL. Du kannst auch eine absolute URL verwenden,
  // besonders wenn dein Frontend nicht vom selben Express-Server ausgeliefert wird.
  // const backendUrl = 'http://localhost:3000'; // Beispiel für absolute URL
  // const loginEndpoint = '/api/login'; // Oder `${backendUrl}/api/login`

  try {
    const response = await fetch('/api/login', { // Bleiben wir vorerst bei der relativen URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      // *** WICHTIG ***: Füge diese Zeile hinzu, damit der Browser Cookies sendet und empfängt
      credentials: 'include'
    });

    const responseData = await response.json(); // Parsen die Antwort immer, um Fehlerdetails zu erhalten

    if (response.ok) { // Prüfen auf Status 200-299
      console.log('Login erfolgreich:', responseData);
      loginSection.style.display = 'none';
      loginError.style.display = 'none';

      // Die Speicherung in localStorage ist optional. Die Authentifizierung selbst
      // wird durch den Session-Cookie gehandhabt, der vom Browser gespeichert wird,
      // wenn credentials: 'include' gesetzt ist. Du kannst localStorage verwenden,
      // um z.B. den Benutzernamen oder die Rolle für die Anzeige im Frontend zu speichern.
      localStorage.setItem('userId', responseData.userId);
      localStorage.setItem('userRole', responseData.role);
      localStorage.setItem('userEmail', responseData.email); // Email könnte auch nützlich sein

      // Weiterleitung zum Dashboard basierend auf der Rolle
      handleLoginSuccess(responseData.role);

      // Jetzt, da der Benutzer eingeloggt ist (und der Browser den Cookie hat),
      // kannst du die Termine abrufen. Diese Aufrufe müssen ebenfalls credentials: 'include' nutzen!
      fetchAndDisplayPastAppointments(); // <-- Stelle sicher, dass diese Funktionen existieren und credentials: 'include' nutzen
      fetchAndDisplayFutureAppointments(); // <-- Stelle sicher, dass diese Funktionen existieren und credentials: 'include' nutzen

    } else { // Nicht-2xx Status (z.B. 401, 400)
      console.error('Login fehlgeschlagen:', response.status, responseData.error);
      loginError.textContent = responseData.error || 'Login fehlgeschlagen.'; // Nutze die Fehlermeldung vom Backend
      loginError.classList.remove('hidden'); // Zeige die Fehlermeldung an (basierend auf deiner CSS-Klasse)
      // Optional: Entferne die Daten aus localStorage, falls vorhanden
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
    }
  } catch (error) { // Netzwerkfehler etc.
    console.error('Fehler beim Login-Request:', error);
    loginError.textContent = 'Verbindungsfehler. Bitte versuche es später erneut.';
    loginError.classList.remove('hidden');
    // Optional: Entferne die Daten aus localStorage, falls vorhanden
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
  }
});

// Stelle sicher, dass deine CSS-Klasse .hidden display: none; hat
// .hidden { display: none; }

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