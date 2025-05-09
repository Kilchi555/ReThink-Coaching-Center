// public/js/login.js - Code für die Login-Seite (index.html)

console.log("login.js geladen!");


// Warten, bis das DOM vollständig geladen ist
document.addEventListener('DOMContentLoaded', function() {

  // Elemente für die Login-Funktionalität holen
  const loginSection = document.getElementById('login-section'); // Annahme: #login-section existiert in index.html
  const loginForm = document.getElementById('login-form');     // Annahme: #login-form existiert in index.html
  const loginError = document.getElementById('login-error');   // Annahme: #login-error existiert in index.html

  // Elemente für Dashboard-Sektionen holen (falls diese auf index.html angezeigt werden)
  // oder für Weiterleitung
  const customerDashboard = document.getElementById('customer-dashboard');
  const employeeDashboard = document.getElementById('employee-dashboard');
  const adminDashboard = document.getElementById('admin-dashboard');
  const pastAppointmentsSection = document.getElementById('past-appointments-section');
  const futureAppointmentsSection = document.getElementById('future-appointments-section');
  const registerSection = document.getElementById('register-section'); // Annahme: #register-section existiert

  // Elemente für Login/Register Links holen (falls diese auf index.html existieren)
  const showRegisterLink = document.getElementById('show-register');
  const showLoginLink = document.getElementById('show-login');


  // Sicherstellen, dass die Hauptelemente existieren, bevor wir Listener hinzufügen
  if (loginForm && loginError && loginSection) {

      // --- EVENT LISTENER ---

      // Handler für den Login Form Submission
      loginForm.addEventListener('submit', async (event) => {
          event.preventDefault(); // Standard-Formularübermittlung verhindern

          const emailInput = document.getElementById('login-email'); // Annahme: #login-email existiert im Formular
          const passwordInput = document.getElementById('login-password'); // Annahme: #login-password existiert im Formular

          // Elemente prüfen
           if (!emailInput || !passwordInput) {
              console.error("Login Formularfelder (login-email, login-password) nicht gefunden.");
              loginError.textContent = 'Formularfelder nicht gefunden.';
              loginError.classList.remove('hidden'); // Stelle sicher, dass die Klasse .hidden existiert und display: none setzt
              return; // Verarbeitung stoppen
          }

          const email = emailInput.value;
          const password = passwordInput.value;

          // Einfache Client-seitige Validierung (optional, Backend validiert vollständig)
          if (!email || !password) {
              loginError.textContent = 'E-Mail und Passwort sind erforderlich.';
              loginError.classList.remove('hidden');
              return;
          }

          const loginEndpoint = '/api/login'; // Dein Backend Login Endpunkt

          try {
              const response = await fetch(loginEndpoint, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      // *** WICHTIG ***: Füge diese Zeile hinzu, damit der Browser Cookies sendet und empfängt
                      credentials: 'include'
                  },
                  body: JSON.stringify({ email, password }), // Daten als JSON-String senden
              });

              const responseData = await response.json(); // JSON-Antwort parsen

              if (response.ok) { // Prüfen auf 2xx Status Codes (Erfolg)
                  console.log('Login erfolgreich:', responseData);

                  // Login-Sektion ausblenden und Fehlermeldung verstecken
                  loginSection.style.display = 'none';
                  loginError.classList.add('hidden'); // Fehlermeldung verstecken

                  // Benutzerdaten im localStorage speichern (optional, Authentifizierung läuft über Cookie)
                  localStorage.setItem('userId', responseData.userId);
                  localStorage.setItem('userRole', responseData.role);
                  localStorage.setItem('userEmail', responseData.email); // Email könnte auch nützlich sein

                  // UI basierend auf der Rolle aktualisieren / zum Dashboard weiterleiten
                  handleLoginSuccess(responseData.role); // Funktion weiter unten definiert

                  // Initialdaten für das Dashboard abrufen (falls auf derselben Seite)
                  // Stelle sicher, dass diese Funktionen implementiert sind und credentials: 'include' nutzen
                   // fetchAndDisplayPastAppointments();
                   // fetchAndDisplayFutureAppointments();


              } else { // Nicht-2xx Status Codes (z.B. 401, 400, 500 - Fehler)
                  console.error('Login fehlgeschlagen:', response.status, responseData.error);
                  loginError.textContent = responseData.error || 'Login fehlgeschlagen.'; // Fehlermeldung vom Backend nutzen
                  loginError.classList.remove('hidden'); // Fehlermeldung anzeigen

                  // Potenziell veraltete Daten im localStorage entfernen
                  localStorage.removeItem('userId');
                  localStorage.removeItem('userRole');
                  localStorage.removeItem('userEmail');
              }

          } catch (error) { // Netzwerkfehler etc.
              console.error('Fehler beim Login-Request:', error);
              loginError.textContent = 'Verbindungsfehler. Bitte versuche es später erneut.';
              loginError.classList.remove('hidden');

               // Potenziell veraltete Daten im localStorage entfernen
              localStorage.removeItem('userId');
              localStorage.removeItem('userRole');
              localStorage.removeItem('userEmail');
          }
      });


      // --- UI-Aktualisierungsfunktionen (falls Dashboard-Sektionen auf index.html sind) ---

      // Funktion, um die Benutzeroberfläche nach erfolgreichem Login oder beim Laden zu aktualisieren
      function handleLoginSuccess(role) {
        console.log(`handleLoginSuccess aufgerufen mit Rolle: ${role}`);
        window.location.href = '/dashboard.html'; // Einheitliches Dashboard
      }      

      // Funktion zum Überprüfen des Login-Status beim Laden der Seite
      function checkLoginStatus() {
          console.log("checkLoginStatus aufgerufen.");
          // Prüfen, ob Benutzerdaten im localStorage vorhanden sind (Hinweis: Session-Cookie ist die wahre Auth-Quelle)
          const userId = localStorage.getItem('userId');
          const userRole = localStorage.getItem('userRole');

          if (userId && userRole) {
               console.log(`Benutzer in localStorage gefunden: ID ${userId}, Rolle ${userRole}. Versuche, Dashboard anzuzeigen.`);
              // Login-Sektion ausblenden
              if (loginSection) loginSection.style.display = 'none';

              // Dashboard-Ansicht basierend auf der Rolle anzeigen
              handleLoginSuccess(userRole);

              // Daten für die Dashboard-Ansicht abrufen (falls auf derselben Seite)
               // fetchAndDisplayPastAppointments();
               // fetchAndDisplayFutureAppointments();

          } else {
               console.log("Kein Benutzer in localStorage gefunden. Zeige Login-Ansicht.");
              // Login-Sektion anzeigen und Dashboards ausblenden
              if (loginSection) loginSection.style.display = 'block';

              // Alle Dashboard/Termin-Sektionen ausblenden
               const customerDashboard = document.getElementById('customer-dashboard');
               const employeeDashboard = document.getElementById('employee-dashboard');
               const adminDashboard = document.getElementById('admin-dashboard');
               const pastAppointmentsSection = document.getElementById('past-appointments-section');
               const futureAppointmentsSection = document.getElementById('future-appointments-section');

               if (customerDashboard) customerDashboard.style.display = 'none';
               if (employeeDashboard) employeeDashboard.style.display = 'none';
               if (adminDashboard) adminDashboard.style.display = 'none';
               if (pastAppointmentsSection) pastAppointmentsSection.style.display = 'none';
               if (futureAppointmentsSection) futureAppointmentsSection.style.display = 'none';
          }
      }

       // Event-Listener für die "Registrieren"/"Einloggen" Links (falls auf index.html)
      if (showRegisterLink) {
          showRegisterLink.addEventListener('click', (event) => {
            event.preventDefault();
            if (loginSection) loginSection.style.display = 'none';
            if (registerSection) registerSection.style.display = 'block'; // Annahme: #register-section existiert und soll gezeigt werden
          });
      }

      if (showLoginLink) {
           showLoginLink.addEventListener('click', (event) => {
            event.preventDefault();
            if (loginSection) loginSection.style.display = 'block';
            if (registerSection) registerSection.style.display = 'none'; // Annahme: #register-section existiert und soll ausgeblendet werden
          });
      }


      // --- Initialisierung ---

      // Überprüfe den Login-Status sofort, sobald das DOM bereit ist
      checkLoginStatus();


  } else {
      // Logge eine Warnung, wenn die notwendigen Elemente für das Login nicht gefunden wurden
      console.warn("Wichtige Login-Elemente (login-form, login-error, login-section) wurden im DOM nicht gefunden. Login-Logik wird möglicherweise nicht initialisiert.");
      // Hier könntest du eine Fehlermeldung auf der Seite anzeigen
  }

   // Placeholder-Funktionen für den Datenabruf (falls Dashboard auf derselben Seite)
  // Diese Funktionen müssten noch implementiert werden
  function fetchAndDisplayPastAppointments() {
      console.log("fetchAndDisplayPastAppointments aufgerufen (Platzhalter)");
      // TODO: Implement fetch request to /api/past-appointments
      // Muss credentials: 'include' nutzen
      // Das Ergebnis parsen und im pastAppointmentsSection anzeigen
  }

  function fetchAndDisplayFutureAppointments() {
      console.log("fetchAndDisplayFutureAppointments aufgerufen (Platzhalter)");
      // TODO: Implement fetch request to /api/future-appointments
      // Muss credentials: 'include' nutzen
      // Das Ergebnis parsen und im futureAppointmentsSection anzeigen
  }


}); // Ende DOMContentLoaded Listener