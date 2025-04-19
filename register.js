const registerForm = document.getElementById('register-form');
const registerError = document.getElementById('register-error');

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Registrierung erfolgreich:', data);
      // Nach erfolgreicher Registrierung direkt einloggen oder zur Login-Seite weiterleiten
      window.location.href = '/login.html';
    } else {
      const errorData = await response.json();
      console.error('Registrierung fehlgeschlagen:', errorData);
      registerError.textContent = errorData.error || 'Registrierung fehlgeschlagen.';
      registerError.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Fehler beim Registrierungs-Request:', error);
    registerError.textContent = 'Verbindungsfehler.';
    registerError.classList.remove('hidden');
  }
});