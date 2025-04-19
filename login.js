const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

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
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('userRole', data.role);
      // Weiterleitung zum User-Dashboard (wir erstellen später eine dashboard.html)
      window.location.href = '/dashboard.html';
    } else {
      const errorData = await response.json();
      console.error('Login fehlgeschlagen:', errorData);
      loginError.textContent = errorData.error || 'Login fehlgeschlagen.';
      loginError.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Fehler beim Login-Request:', error);
    loginError.textContent = 'Verbindungsfehler.';
    loginError.classList.remove('hidden');
  }
});